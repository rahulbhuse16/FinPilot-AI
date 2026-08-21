from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.middleware.request_logging import (
    request_logging_middleware,
)
from app.core.exceptions import (
    global_exception_handler,
)
from app.core.config import settings
from app.core.database import connect_db, close_db
from app.api.routes.health import router as health_router
from app.api.routes.customers import router as customers_router
from app.api.routes.accounts import router as accounts_router
from app.api.routes.transactions import router as transactions_router
from app.api.routes.loans import router as loans_router
from app.api.routes.customer_360 import router as customer_360_router
from app.api.routes.documents import router as documents_router
from app.api.routes.ai import router as ai_router
from app.api.routes.analyst import (
    router as analyst_router,
)

from app.api.routes.conversations import (
    router as conversations_router,
)
from app.api.routes.anomalies import (
    router as anomalies_router,
)
from app.api.routes.dashboard import (
    router as dashboard_router,
)
from app.core.logging import setup_logging


setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()

    yield

    await close_db()


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
    customers_router,
    prefix=settings.api_prefix,
)

app.include_router(
    accounts_router,
    prefix=settings.api_prefix,
)

app.include_router(
    transactions_router,
    prefix=settings.api_prefix,
)

app.include_router(
    loans_router,
    prefix=settings.api_prefix,
)

app.include_router(
    customer_360_router,
    prefix=settings.api_prefix,
)

app.include_router(
    documents_router,
    prefix=settings.api_prefix,
)

app.include_router(
    ai_router,
    prefix=settings.api_prefix,
)

app.include_router(
    analyst_router,
    prefix=settings.api_prefix,
)
app.include_router(
    conversations_router,
    prefix=settings.api_prefix,
)

app.include_router(
    anomalies_router,
    prefix=settings.api_prefix,
)

app.include_router(
    dashboard_router,
    prefix=settings.api_prefix,
)


