from pydantic import BaseModel


class LoanRequest(BaseModel):
    copy_id: int


class AdminApproveLoan(BaseModel):
    due_at: str  # ISO-8601


class AdminRejectLoan(BaseModel):
    reason: str


class AdminLoanOut(BaseModel):
    id: int
    user_id: int
    user_name: str | None = None
    copy_id: int
    copy_code: str | None = None
    book_id: int | None = None
    book_title: str | None = None
    book_authors: str | None = None
    status: str
    due_at: str | None = None
    borrowed_at: str | None = None
    returned_at: str | None = None
    # Thêm các trường phạt tiền
    fine_amount: float | None = 0
    fine_note: str | None = None
    fine_paid: bool | None = False
    fine_paid_at: str | None = None
    fine_confirmed_by: int | None = None


class AdminLoanCreate(BaseModel):
    user_id: int
    copy_id: int
    status: str = "requested"
    due_at: str | None = None
    borrowed_at: str | None = None
    returned_at: str | None = None
    # Thêm các trường phạt tiền
    fine_amount: float | None = 0
    fine_note: str | None = None
    fine_paid: bool | None = False
    fine_paid_at: str | None = None
    fine_confirmed_by: int | None = None

class AdminLoanUpdate(BaseModel):
    status: str | None = None
    due_at: str | None = None
    borrowed_at: str | None = None
    returned_at: str | None = None
    # Thêm các trường phạt tiền
    fine_amount: float | None = None
    fine_note: str | None = None
    fine_paid: bool | None = None
    fine_paid_at: str | None = None
    fine_confirmed_by: int | None = None


