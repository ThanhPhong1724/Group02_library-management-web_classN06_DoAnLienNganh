from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, select, update, func, or_, String, distinct
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.copy import Copy
from ..models.loan import Loan
from ..models.policy import Policy  # Giả sử Policy là model cho bảng chinh_sach
from ..models.user import User
from ..models.book import Book
from ..security.deps import CurrentUser, get_current_user
from ..schemas.loans import AdminApproveLoan, AdminRejectLoan, LoanRequest, AdminLoanOut, AdminLoanCreate, AdminLoanUpdate
from ..models.misc import create_notification

router = APIRouter(prefix="", tags=["loans"])


@router.post("/loans/request")
def request_loan(payload: LoanRequest, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    # copy must be available
    c = db.get(Copy, payload.copy_id)
    if not c:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_COPY", "message": "Copy not found", "details": {}}})
    if c.trang_thai != "available":
        raise HTTPException(status_code=400, detail={"error": {"code": "COPY_NOT_AVAILABLE", "message": "Copy not available", "details": {}}})
    # 1. Kiểm tra số lượng sách đang mượn
    max_loans = db.execute(
        select(func.coalesce(Policy.toi_da_muon, 5)).where(Policy.loai_nguoi_dung == user.user_type)
    ).scalar_one_or_none() or 5
    current_loans = db.execute(
        select(func.count()).select_from(Loan).where(
            Loan.id_nguoi_dung == user.user_id,
            Loan.trang_thai.in_(["requested", "borrowed", "return_requested"])
        )
    ).scalar()
    if current_loans >= max_loans:
        raise HTTPException(status_code=400, detail="Bạn đã mượn tối đa số sách cho phép.")
    # 2. Không cho mượn 2 bản sao của cùng 1 sách
    book_id = c.id_sach
    has_same_book = db.execute(
        select(func.count()).select_from(Loan).join(Copy, Loan.id_ban_sao == Copy.id).where(
            Loan.id_nguoi_dung == user.user_id,
            Copy.id_sach == book_id,
            Loan.trang_thai.in_(["requested", "borrowed", "return_requested"])
        )
    ).scalar()
    if has_same_book:
        raise HTTPException(status_code=400, detail="Bạn đã mượn một bản sao của sách này rồi.")
    loan = Loan(id_ban_sao=c.id, id_nguoi_dung=user.user_id, trang_thai="requested")
    c.trang_thai = "reserved"
    db.add(loan)
    db.add(c)
    db.commit()
    db.refresh(loan)
    # Gửi thông báo cho admin
    admins = db.execute(select(User).where(User.vai_tro == "admin")).scalars().all()
    for admin in admins:
        create_notification(db, admin.id, "loan_request", f"Yêu cầu mượn sách mới từ {user.full_name}", f"Người dùng {user.full_name} vừa yêu cầu mượn sách (ID bản sao: {c.id})")
    return {"id": loan.id, "status": loan.trang_thai}


@router.post("/loans/{loan_id}/request-return")
def request_return(loan_id: int, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    loan = db.get(Loan, loan_id)
    if not loan or loan.id_nguoi_dung != user.user_id:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Loan not found", "details": {}}})
    if loan.trang_thai != "borrowed":
        raise HTTPException(status_code=400, detail={"error": {"code": "BAD_STATE", "message": "Only borrowed can request return", "details": {}}})
    loan.trang_thai = "return_requested"
    loan.yeu_cau_tra_luc = datetime.utcnow()
    db.add(loan)
    db.commit()
    # Gửi thông báo cho admin
    admins = db.execute(select(User).where(User.vai_tro == "admin")).scalars().all()
    for admin in admins:
        create_notification(db, admin.id, "return_request", f"Yêu cầu trả sách từ {user.full_name}", f"Người dùng {user.full_name} vừa yêu cầu trả sách (ID phiếu mượn: {loan.id})")
    return {"id": loan.id, "status": loan.trang_thai}


@router.get("/me/loans")
def list_my_loans(
    status: Optional[str] = Query(None),
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from ..models.copy import Copy
    from ..models.book import Book
    stmt = (
        select(Loan, Copy.ma_ban_sao, Book.tieu_de, Book.tac_gia)
        .join(Copy, Loan.id_ban_sao == Copy.id)
        .join(Book, Copy.id_sach == Book.id)
        .where(Loan.id_nguoi_dung == user.user_id)
    )
    if status:
        status_list = [s.strip() for s in status.split(",") if s.strip()]
        if len(status_list) == 1:
            stmt = stmt.where(Loan.trang_thai == status_list[0])
        elif len(status_list) > 1:
            stmt = stmt.where(Loan.trang_thai.in_(status_list))
    rows = db.execute(stmt.order_by(Loan.id.desc())).all()
    return [
        {
            "id": r.Loan.id,
            "copy_id": r.Loan.id_ban_sao,
            "copy_code": r.ma_ban_sao,
            "book_title": r.tieu_de,
            "book_authors": r.tac_gia,
            "status": r.Loan.trang_thai,
            "due_at": r.Loan.han_tra,
            "borrowed_at": r.Loan.muon_luc,
            "returned_at": r.Loan.tra_luc,
            "fine_amount": float(r.Loan.so_tien_phat or 0),
            "fine_note": r.Loan.noi_dung_phat,
            "fine_paid": bool(r.Loan.da_nop_phat),
            "fine_paid_at": r.Loan.ngay_nop_phat,
            "fine_confirmed_by": r.Loan.admin_xac_nhan_phat,
        }
        for r in rows
    ]


@router.get("/admin/users/types")
def list_user_types(user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    rows = db.execute(select(distinct(User.loai_nguoi_dung))).scalars().all()
    return [r for r in rows if r]


@router.get("/admin/loans", response_model=list[AdminLoanOut])
def list_admin_loans(
    status: Optional[str] = Query(None),
    user_type: Optional[str] = Query(None),
    borrowed_from: Optional[str] = Query(None),
    borrowed_to: Optional[str] = Query(None),
    due_from: Optional[str] = Query(None),
    due_to: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    stmt = select(
        Loan,
        User.ho_ten.label("user_name"),
        Copy.id_sach.label("book_id"),
        Copy.ma_ban_sao.label("copy_code"),
        Book.tieu_de.label("book_title"),
        Book.tac_gia.label("book_authors"),
        User.loai_nguoi_dung.label("user_type")
    ).join(User, Loan.id_nguoi_dung == User.id)
    stmt = stmt.join(Copy, Loan.id_ban_sao == Copy.id)
    stmt = stmt.join(Book, Copy.id_sach == Book.id)
    if status:
        status_list = [s.strip() for s in status.split(",") if s.strip()]
        if len(status_list) == 1:
            stmt = stmt.where(Loan.trang_thai == status_list[0])
        elif len(status_list) > 1:
            stmt = stmt.where(Loan.trang_thai.in_(status_list))
    if user_type and user_type != 'all':
        stmt = stmt.where(User.loai_nguoi_dung == user_type)
    if borrowed_from:
        stmt = stmt.where(Loan.muon_luc >= borrowed_from)
    if borrowed_to:
        stmt = stmt.where(Loan.muon_luc <= borrowed_to)
    if due_from:
        stmt = stmt.where(Loan.han_tra >= due_from)
    if due_to:
        stmt = stmt.where(Loan.han_tra <= due_to)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            or_(
                func.lower(User.ho_ten).like(func.lower(like)),
                func.lower(User.email).like(func.lower(like)),
                func.lower(Copy.ma_ban_sao).like(func.lower(like)),
                func.lower(Book.tieu_de).like(func.lower(like)),
                func.lower(Book.tac_gia).like(func.lower(like)),
            )
        )
    rows = db.execute(stmt.order_by(Loan.id.desc())).all()
    result = []
    for r in rows:
        loan: Loan = r[0]
        result.append(AdminLoanOut(
            id=loan.id,
            user_id=loan.id_nguoi_dung,
            user_name=r.user_name,
            copy_id=loan.id_ban_sao,
            copy_code=r.copy_code,
            book_id=r.book_id,
            book_title=r.book_title,
            book_authors=r.book_authors,
            status=loan.trang_thai,
            due_at=loan.han_tra.isoformat() if loan.han_tra else None,
            borrowed_at=loan.muon_luc.isoformat() if loan.muon_luc else None,
            returned_at=loan.tra_luc.isoformat() if loan.tra_luc else None,
            fine_amount=float(loan.so_tien_phat or 0),
            fine_note=loan.noi_dung_phat,
            fine_paid=bool(loan.da_nop_phat),
            fine_paid_at=loan.ngay_nop_phat.isoformat() if loan.ngay_nop_phat else None,
            fine_confirmed_by=loan.admin_xac_nhan_phat,
        ))
    return result


@router.post("/admin/loans/{loan_id}/approve")
def admin_approve(loan_id: int, payload: AdminApproveLoan, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    loan = db.get(Loan, loan_id)
    if not loan or loan.trang_thai != "requested":
        raise HTTPException(status_code=400, detail={"error": {"code": "BAD_STATE", "message": "Loan not in requested state", "details": {}}})
    copy = db.get(Copy, loan.id_ban_sao)
    if not copy:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_COPY", "message": "Copy not found", "details": {}}})
    # 3. Kiểm tra số ngày mượn tối đa
    # Lấy user_type của người mượn
    borrower = db.get(User, loan.id_nguoi_dung)
    user_type = getattr(borrower, "loai_nguoi_dung", "student")
    max_days = db.execute(
        select(func.coalesce(Policy.so_ngay_muon, 14)).where(Policy.loai_nguoi_dung == user_type)
    ).scalar_one_or_none() or 14
    borrow_date = datetime.utcnow()
    try:
        due_date = datetime.fromisoformat(payload.due_at.replace("Z", "+00:00"))
    except Exception:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_DUE_AT", "message": "Invalid ISO datetime", "details": {}}})
    if (due_date - borrow_date).days > max_days:
        raise HTTPException(status_code=400, detail=f"Hạn trả vượt quá số ngày mượn tối đa ({max_days} ngày) cho phép.")
    loan.trang_thai = "borrowed"
    loan.nguoi_duyet = user.user_id
    loan.duyet_luc = borrow_date
    loan.muon_luc = borrow_date
    loan.han_tra = due_date
    copy.trang_thai = "on_loan"
    db.add_all([loan, copy])
    db.commit()
    # Gửi thông báo cho người mượn
    create_notification(db, loan.id_nguoi_dung, "loan_approved", "Yêu cầu mượn sách đã được duyệt", f"Yêu cầu mượn sách của bạn đã được duyệt. Hạn trả: {loan.han_tra.strftime('%d/%m/%Y') if loan.han_tra else ''}")
    return {"id": loan.id, "status": loan.trang_thai}


@router.post("/admin/loans/{loan_id}/reject")
def admin_reject(loan_id: int, payload: AdminRejectLoan, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    loan = db.get(Loan, loan_id)
    if not loan or loan.trang_thai != "requested":
        raise HTTPException(status_code=400, detail={"error": {"code": "BAD_STATE", "message": "Loan not in requested state", "details": {}}})
    copy = db.get(Copy, loan.id_ban_sao)
    if not copy:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_COPY", "message": "Copy not found", "details": {}}})
    loan.trang_thai = "rejected"
    loan.ly_do_tu_choi = payload.reason
    loan.nguoi_duyet = user.user_id
    loan.duyet_luc = datetime.utcnow()
    copy.trang_thai = "available"
    db.add_all([loan, copy])
    db.commit()
    # Gửi thông báo cho người mượn
    create_notification(db, loan.id_nguoi_dung, "loan_rejected", "Yêu cầu mượn sách bị từ chối", f"Yêu cầu mượn sách của bạn đã bị từ chối. Lý do: {payload.reason}")
    return {"id": loan.id, "status": loan.trang_thai}


@router.post("/admin/loans/{loan_id}/approve-return")
def admin_approve_return(loan_id: int, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    loan = db.get(Loan, loan_id)
    if not loan or loan.trang_thai not in {"return_requested", "borrowed"}:
        raise HTTPException(status_code=400, detail={"error": {"code": "BAD_STATE", "message": "Loan not in returnable state", "details": {}}})
    copy = db.get(Copy, loan.id_ban_sao)
    if not copy:
        raise HTTPException(status_code=400, detail={"error": {"code": "INVALID_COPY", "message": "Copy not found", "details": {}}})
    loan.trang_thai = "returned"
    loan.nguoi_duyet_tra = user.user_id
    loan.tra_luc = datetime.utcnow()
    copy.trang_thai = "available"
    # Tính phạt nếu trả trễ
    if loan.han_tra and loan.tra_luc and loan.tra_luc > loan.han_tra:
        days_late = (loan.tra_luc - loan.han_tra).days
        borrower = db.get(User, loan.id_nguoi_dung)
        user_type = getattr(borrower, "loai_nguoi_dung", "student")
        fine_per_day = db.execute(
            select(func.coalesce(Policy.phat_moi_ngay, 10000)).where(Policy.loai_nguoi_dung == user_type)
        ).scalar_one_or_none() or 10000
        loan.so_tien_phat = days_late * int(fine_per_day)
        loan.noi_dung_phat = f"Trả trễ {days_late} ngày"
    else:
        loan.so_tien_phat = 0
        loan.noi_dung_phat = None
    db.add_all([loan, copy])
    db.commit()
    # Gửi thông báo cho người mượn
    if loan.so_tien_phat and loan.so_tien_phat > 0:
        create_notification(db, loan.id_nguoi_dung, "loan_fined", "Bạn bị phạt do trả sách trễ", f"Bạn bị phạt {int(loan.so_tien_phat):,} VND do trả sách trễ. {loan.noi_dung_phat or ''}")
    else:
        create_notification(db, loan.id_nguoi_dung, "loan_returned", "Trả sách thành công", "Bạn đã trả sách thành công. Cảm ơn bạn!")
    return {"id": loan.id, "status": loan.trang_thai}


@router.post("/admin/loans", response_model=AdminLoanOut)
def admin_create_loan(payload: AdminLoanCreate, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    # Kiểm tra copy tồn tại
    copy = db.get(Copy, payload.copy_id)
    if not copy:
        raise HTTPException(status_code=400, detail="Copy not found")
    # Kiểm tra user tồn tại
    borrower = db.get(User, payload.user_id)
    if not borrower:
        raise HTTPException(status_code=400, detail="User not found")
    loan = Loan(
        id_ban_sao=payload.copy_id,
        id_nguoi_dung=payload.user_id,
        trang_thai=payload.status or "requested",
        han_tra=datetime.fromisoformat(payload.due_at) if payload.due_at else None,
        muon_luc=datetime.fromisoformat(payload.borrowed_at) if payload.borrowed_at else None,
        tra_luc=datetime.fromisoformat(payload.returned_at) if payload.returned_at else None,
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)
    # Trả về thông tin đầy đủ
    stmt = select(
        Loan,
        User.ho_ten.label("user_name"),
        Copy.id_sach.label("book_id"),
        Copy.ma_ban_sao.label("copy_code"),
        Book.tieu_de.label("book_title"),
        Book.tac_gia.label("book_authors")
    ).join(User, Loan.id_nguoi_dung == User.id)
    stmt = stmt.join(Copy, Loan.id_ban_sao == Copy.id)
    stmt = stmt.join(Book, Copy.id_sach == Book.id)
    stmt = stmt.where(Loan.id == loan.id)
    r = db.execute(stmt).first()
    loan_obj: Loan = r[0]
    return AdminLoanOut(
        id=loan_obj.id,
        user_id=loan_obj.id_nguoi_dung,
        user_name=r.user_name,
        copy_id=loan_obj.id_ban_sao,
        copy_code=r.copy_code,
        book_id=r.book_id,
        book_title=r.book_title,
        book_authors=r.book_authors,
        status=loan_obj.trang_thai,
        due_at=loan_obj.han_tra.isoformat() if loan_obj.han_tra else None,
        borrowed_at=loan_obj.muon_luc.isoformat() if loan_obj.muon_luc else None,
        returned_at=loan_obj.tra_luc.isoformat() if loan_obj.tra_luc else None,
        fine_amount=float(loan_obj.so_tien_phat or 0),
        fine_note=loan_obj.noi_dung_phat,
        fine_paid=bool(loan_obj.da_nop_phat),
        fine_paid_at=loan_obj.ngay_nop_phat.isoformat() if loan_obj.ngay_nop_phat else None,
        fine_confirmed_by=loan_obj.admin_xac_nhan_phat,
    )

@router.put("/admin/loans/{loan_id}", response_model=AdminLoanOut)
def admin_update_loan(loan_id: int, payload: AdminLoanUpdate, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    loan = db.get(Loan, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    if payload.status:
        loan.trang_thai = payload.status
        # Tự động tính phạt nếu chuyển sang overdue
        if payload.status == "overdue" and loan.han_tra:
            now = datetime.utcnow()
            if now > loan.han_tra:
                days_late = (now - loan.han_tra).days
                borrower = db.get(User, loan.id_nguoi_dung)
                user_type = getattr(borrower, "loai_nguoi_dung", "student")
                fine_per_day = db.execute(
                    select(func.coalesce(Policy.phat_moi_ngay, 10000)).where(Policy.loai_nguoi_dung == user_type)
                ).scalar_one_or_none() or 10000
                loan.so_tien_phat = days_late * int(fine_per_day)
                loan.noi_dung_phat = f"Quá hạn {days_late} ngày"
                # Gửi cảnh báo quá hạn
                msg = f"Bạn đã quá hạn trả sách {days_late} ngày. Số tiền phạt hiện tại: {loan.so_tien_phat:,} VND."
                if days_late >= 7:
                    msg += " Nếu quá hạn trên 7 ngày, tài khoản sẽ bị khóa!"
                create_notification(db, loan.id_nguoi_dung, "overdue_warning", "Cảnh báo quá hạn trả sách", msg)
            else:
                loan.so_tien_phat = 0
                loan.noi_dung_phat = None
    if payload.due_at:
        loan.han_tra = datetime.fromisoformat(payload.due_at)
    if payload.borrowed_at:
        loan.muon_luc = datetime.fromisoformat(payload.borrowed_at)
    if payload.returned_at:
        loan.tra_luc = datetime.fromisoformat(payload.returned_at)
    if payload.fine_amount is not None:
        loan.so_tien_phat = payload.fine_amount
    if payload.fine_note is not None:
        loan.noi_dung_phat = payload.fine_note
    if payload.fine_paid is not None:
        loan.da_nop_phat = payload.fine_paid
        if payload.fine_paid:
            loan.ngay_nop_phat = payload.fine_paid_at or datetime.utcnow()
            loan.admin_xac_nhan_phat = user.user_id
            # Gửi thông báo xác nhận đã nộp phạt
            create_notification(db, loan.id_nguoi_dung, "fine_confirmed", "Xác nhận đã nộp phạt", "Tiền phạt của bạn đã được xác nhận. Cảm ơn bạn!")
        else:
            loan.ngay_nop_phat = None
            loan.admin_xac_nhan_phat = None
    if payload.fine_paid_at is not None:
        loan.ngay_nop_phat = payload.fine_paid_at
    if payload.fine_confirmed_by is not None:
        loan.admin_xac_nhan_phat = payload.fine_confirmed_by
    db.add(loan)
    db.commit()
    db.refresh(loan)
    # Trả về thông tin đầy đủ
    stmt = select(
        Loan,
        User.ho_ten.label("user_name"),
        Copy.id_sach.label("book_id"),
        Copy.ma_ban_sao.label("copy_code"),
        Book.tieu_de.label("book_title"),
        Book.tac_gia.label("book_authors")
    ).join(User, Loan.id_nguoi_dung == User.id)
    stmt = stmt.join(Copy, Loan.id_ban_sao == Copy.id)
    stmt = stmt.join(Book, Copy.id_sach == Book.id)
    stmt = stmt.where(Loan.id == loan.id)
    r = db.execute(stmt).first()
    loan_obj: Loan = r[0]
    return AdminLoanOut(
        id=loan_obj.id,
        user_id=loan_obj.id_nguoi_dung,
        user_name=r.user_name,
        copy_id=loan_obj.id_ban_sao,
        copy_code=r.copy_code,
        book_id=r.book_id,
        book_title=r.book_title,
        book_authors=r.book_authors,
        status=loan_obj.trang_thai,
        due_at=loan_obj.han_tra.isoformat() if loan_obj.han_tra else None,
        borrowed_at=loan_obj.muon_luc.isoformat() if loan_obj.muon_luc else None,
        returned_at=loan_obj.tra_luc.isoformat() if loan_obj.tra_luc else None,
        fine_amount=float(loan_obj.so_tien_phat or 0),
        fine_note=loan_obj.noi_dung_phat,
        fine_paid=bool(loan_obj.da_nop_phat),
        fine_paid_at=loan_obj.ngay_nop_phat.isoformat() if loan_obj.ngay_nop_phat else None,
        fine_confirmed_by=loan_obj.admin_xac_nhan_phat,
    )

@router.delete("/admin/loans/{loan_id}")
def admin_delete_loan(loan_id: int, user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    loan = db.get(Loan, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    db.delete(loan)
    db.commit()
    return {"ok": True}


@router.get("/admin/users")
def list_admin_users(
    search: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=200),
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    stmt = select(User)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            or_(
                func.lower(User.ho_ten).like(func.lower(like)),
                func.lower(User.email).like(func.lower(like)),
                func.lower(User.id.cast(String)).like(func.lower(like))
            )
        )
    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar()
    rows = db.execute(stmt.order_by(User.id.desc()).offset((page-1)*limit).limit(limit)).scalars().all()
    return {
        "items": [
            {
                "id": u.id,
                "full_name": u.ho_ten,
                "email": u.email,
                "role": u.vai_tro,
                "user_type": u.loai_nguoi_dung,
            } for u in rows
        ],
        "total": total,
        "page": page,
        "total_pages": (total // limit) + (1 if total % limit else 0)
    }


@router.get("/admin/reports/overview")
def admin_reports_overview(user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    total_books = db.execute(select(func.count()).select_from(Book)).scalar()
    total_copies = db.execute(select(func.count()).select_from(Copy)).scalar()
    total_users = db.execute(select(func.count()).select_from(User)).scalar()
    total_loans = db.execute(select(func.count()).select_from(Loan)).scalar()
    total_returns = db.execute(select(func.count()).select_from(Loan).where(Loan.trang_thai == "returned")).scalar()
    total_overdue = db.execute(select(func.count()).select_from(Loan).where(Loan.trang_thai == "overdue")).scalar()
    # Tổng tiền phạt: sum số ngày trễ * phạt mỗi ngày (lấy theo chinh_sach)
    overdue_loans = db.execute(select(Loan.muon_luc, Loan.han_tra, Loan.tra_luc, Loan.id_nguoi_dung).where(Loan.trang_thai.in_(["overdue", "returned"]))).all()
    total_fines = 0
    for muon_luc, han_tra, tra_luc, user_id in overdue_loans:
        if not han_tra: continue
        if tra_luc and tra_luc > han_tra:
            days_late = (tra_luc - han_tra).days
        elif not tra_luc:
            now = datetime.utcnow()
            if now > han_tra:
                days_late = (now - han_tra).days
            else:
                days_late = 0
        else:
            days_late = 0
        if days_late > 0:
            # Lấy loại người dùng
            user = db.get(User, user_id)
            user_type = getattr(user, "loai_nguoi_dung", "student")
            fine = db.execute(select(func.coalesce(Policy.phat_moi_ngay, 10000)).where(Policy.loai_nguoi_dung == user_type)).scalar_one_or_none() or 10000
            total_fines += days_late * int(fine)
    return {
        "total_books": total_books,
        "total_copies": total_copies,
        "total_users": total_users,
        "total_loans": total_loans,
        "total_returns": total_returns,
        "total_overdue": total_overdue,
        "total_fines": total_fines
    }


@router.get("/admin/reports/top-books")
def admin_reports_top_books(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    stmt = select(
        Book.id,
        Book.tieu_de.label("title"),
        Book.tac_gia.label("authors"),
        func.count(Loan.id).label("loan_count")
    ).join(Copy, Copy.id_sach == Book.id)
    stmt = stmt.join(Loan, Loan.id_ban_sao == Copy.id)
    if from_date:
        stmt = stmt.where(Loan.muon_luc >= from_date)
    if to_date:
        stmt = stmt.where(Loan.muon_luc <= to_date)
    stmt = stmt.group_by(Book.id, Book.tieu_de, Book.tac_gia)
    stmt = stmt.order_by(func.count(Loan.id).desc())
    stmt = stmt.limit(limit)
    rows = db.execute(stmt).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "authors": r.authors,
            "loan_count": r.loan_count
        } for r in rows
    ]


@router.get("/admin/reports/top-users")
def admin_reports_top_users(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    stmt = select(
        User.id,
        User.ho_ten.label("full_name"),
        User.email,
        User.loai_nguoi_dung.label("user_type"),
        func.count(Loan.id).label("loan_count")
    ).join(Loan, Loan.id_nguoi_dung == User.id)
    if from_date:
        stmt = stmt.where(Loan.muon_luc >= from_date)
    if to_date:
        stmt = stmt.where(Loan.muon_luc <= to_date)
    stmt = stmt.group_by(User.id, User.ho_ten, User.email, User.loai_nguoi_dung)
    stmt = stmt.order_by(func.count(Loan.id).desc())
    stmt = stmt.limit(limit)
    rows = db.execute(stmt).all()
    return [
        {
            "id": r.id,
            "full_name": r.full_name,
            "email": r.email,
            "user_type": r.user_type,
            "loan_count": r.loan_count
        } for r in rows
    ]


@router.get("/admin/reports/top-overdue")
def admin_reports_top_overdue(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    stmt = select(
        Book.id,
        Book.tieu_de.label("title"),
        Book.tac_gia.label("authors"),
        func.count(Loan.id).label("overdue_count")
    ).join(Copy, Copy.id_sach == Book.id)
    stmt = stmt.join(Loan, Loan.id_ban_sao == Copy.id)
    stmt = stmt.where(Loan.trang_thai == "overdue")
    if from_date:
        stmt = stmt.where(Loan.han_tra >= from_date)
    if to_date:
        stmt = stmt.where(Loan.han_tra <= to_date)
    stmt = stmt.group_by(Book.id, Book.tieu_de, Book.tac_gia)
    stmt = stmt.order_by(func.count(Loan.id).desc())
    stmt = stmt.limit(limit)
    rows = db.execute(stmt).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "authors": r.authors,
            "overdue_count": r.overdue_count
        } for r in rows
    ]


@router.get("/admin/reports/fines")
def admin_reports_fines(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    group_by: str = Query("day"),
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    # Lấy các loan quá hạn hoặc đã trả bị trễ
    stmt = select(Loan.muon_luc, Loan.han_tra, Loan.tra_luc, Loan.id_nguoi_dung)
    if from_date:
        stmt = stmt.where(Loan.han_tra >= from_date)
    if to_date:
        stmt = stmt.where(Loan.han_tra <= to_date)
    rows = db.execute(stmt).all()
    fines_by = {}
    for muon_luc, han_tra, tra_luc, user_id in rows:
        if not han_tra: continue
        if tra_luc and tra_luc > han_tra:
            days_late = (tra_luc - han_tra).days
            fine_date = tra_luc
        elif not tra_luc:
            now = datetime.utcnow()
            if now > han_tra:
                days_late = (now - han_tra).days
                fine_date = now
            else:
                days_late = 0
                fine_date = han_tra
        else:
            days_late = 0
            fine_date = han_tra
        if days_late > 0:
            user = db.get(User, user_id)
            user_type = getattr(user, "loai_nguoi_dung", "student")
            fine = db.execute(select(func.coalesce(Policy.phat_moi_ngay, 10000)).where(Policy.loai_nguoi_dung == user_type)).scalar_one_or_none() or 10000
            key = None
            if group_by == "month":
                key = fine_date.strftime("%Y-%m")
            else:
                key = fine_date.strftime("%Y-%m-%d")
            fines_by[key] = fines_by.get(key, 0) + days_late * int(fine)
    # Trả về dạng list sorted
    result = [ {"date": k, "total_fine": v} for k, v in sorted(fines_by.items()) ]
    return result


@router.get("/admin/reports/loans-by-month")
def admin_reports_loans_by_month(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail={"error": {"code": "FORBIDDEN", "message": "Admin only", "details": {}}})
    # Lượt mượn theo tháng
    stmt_borrow = select(
        func.date_format(Loan.muon_luc, '%Y-%m').label('month'),
        func.count(Loan.id).label('borrow_count')
    ).where(Loan.muon_luc != None)
    if from_date:
        stmt_borrow = stmt_borrow.where(Loan.muon_luc >= from_date)
    if to_date:
        stmt_borrow = stmt_borrow.where(Loan.muon_luc <= to_date)
    stmt_borrow = stmt_borrow.group_by('month').order_by('month')
    borrow_data = db.execute(stmt_borrow).all()
    # Lượt trả theo tháng
    stmt_return = select(
        func.date_format(Loan.tra_luc, '%Y-%m').label('month'),
        func.count(Loan.id).label('return_count')
    ).where(Loan.tra_luc != None)
    if from_date:
        stmt_return = stmt_return.where(Loan.tra_luc >= from_date)
    if to_date:
        stmt_return = stmt_return.where(Loan.tra_luc <= to_date)
    stmt_return = stmt_return.group_by('month').order_by('month')
    return_data = db.execute(stmt_return).all()
    # Gộp dữ liệu
    result = {}
    for r in borrow_data:
        result[r.month] = {"month": r.month, "borrow_count": r.borrow_count, "return_count": 0}
    for r in return_data:
        if r.month in result:
            result[r.month]["return_count"] = r.return_count
        else:
            result[r.month] = {"month": r.month, "borrow_count": 0, "return_count": r.return_count}
    return sorted(result.values(), key=lambda x: x["month"])


