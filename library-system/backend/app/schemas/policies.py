from pydantic import BaseModel


class PolicyOut(BaseModel):
    user_type: str
    max_loans: int
    loan_days: int
    fine_per_day: float
    renew_times: int


class PolicyUpdate(BaseModel):
    max_loans: int | None = None
    loan_days: int | None = None
    fine_per_day: float | None = None
    renew_times: int | None = None


