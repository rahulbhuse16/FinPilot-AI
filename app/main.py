from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.deps import require_admin
from app.api.middleware.request_logging import request_logging_middleware
from app.api.routes.accounts import router as accounts_router
from app.api.routes.admin import router as admin_router
from app.api.routes.ai import router as ai_router
from app.api.routes.analyst import router as analyst_router
from app.api.routes.anomalies import router as anomalies_router
from app.api.routes.assistant import router as assistant_router
from app.api.routes.auth import router as auth_router
from app.api.routes.conversations import router as conversations_router
from app.api.routes.customer_360 import router as customer_360_router
from app.api.routes.customers import router as customers_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.documents import router as documents_router
from app.api.routes.health import router as health_router
from app.api.routes.loans import router as loans_router
from app.api.routes.portal import router as portal_router
from app.api.routes.transactions import router as transactions_router
from app.api.routes.sse import router as sse_router
from app.api.routes.notification import router as notification_router
# main.py

from app.api.routes.push import router as push_router


from app.core.config import settings
from app.core.database import close_db, connect_db
from app.core.exceptions import global_exception_handler
from app.core.logging import setup_logging


setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Sync SQLAlchemy connection
    connect_db()

    yield

    # Sync SQLAlchemy shutdown
    close_db()


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)


app.middleware("http")(
    request_logging_middleware
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://rahulbhuse16.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.add_exception_handler(
    Exception,
    global_exception_handler,
)


app.include_router(
    health_router,
    prefix=settings.api_prefix,
)

app.include_router(
    auth_router,
    prefix=settings.api_prefix,
)

app.include_router(
    portal_router,
    prefix=settings.api_prefix,
)

app.include_router(
    admin_router,
    prefix=settings.api_prefix,
)

app.include_router(
    assistant_router,
    prefix=settings.api_prefix,
)

app.include_router(notification_router,prefix=settings.api_prefix)
app.include_router(sse_router,prefix=settings.api_prefix)
app.include_router(
    push_router,
    prefix="/api/v1",
)


ADMIN_ONLY = [Depends(require_admin)]


for admin_scoped_router in (
    customers_router,
    accounts_router,
    transactions_router,
    loans_router,
    customer_360_router,
    documents_router,
    ai_router,
    analyst_router,
    conversations_router,
    anomalies_router,
    dashboard_router,
):
    app.include_router(
        admin_scoped_router,
        prefix=settings.api_prefix,
    )