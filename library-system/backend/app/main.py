from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .routers.publishers import router as publishers_router
from .routers.books import router as books_router
from .routers.images import router as images_router
from .routers.locations import router as locations_router
from .routers.copies import router as copies_router
from .routers.loans import router as loans_router
from .routers.notifications import router as notifications_router
from .routers.settings_policies import router as settings_policies_router
from .routers.auth import router as auth_router
from .routers.users import router as users_router
from .routers.rules import router as rules_router


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, debug=settings.debug)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(_: Request, exc: HTTPException):
        detail = exc.detail
        if isinstance(detail, dict) and "error" in detail:
            content = detail
        else:
            content = {
                "error": {
                    "code": "HTTP_ERROR",
                    "message": str(detail) if detail else "HTTP error",
                    "details": {},
                }
            }
        return JSONResponse(status_code=exc.status_code, content=content)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, exc: Exception):
        # Generic error format per docs
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": str(exc),
                    "details": {},
                }
            },
        )

    @app.get("/api/health")
    def healthcheck():
        return {"status": "ok"}

    # Routers (prefix /api)
    app.include_router(publishers_router, prefix="/api")
    app.include_router(books_router, prefix="/api")
    app.include_router(images_router, prefix="/api")
    app.include_router(locations_router, prefix="/api")
    app.include_router(copies_router, prefix="/api")
    app.include_router(loans_router, prefix="/api")
    app.include_router(notifications_router, prefix="/api")
    app.include_router(settings_policies_router, prefix="/api")
    app.include_router(auth_router, prefix="/api")
    app.include_router(users_router, prefix="/api")
    app.include_router(rules_router)

    return app


app = create_app()


