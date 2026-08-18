from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from .config import settings

# Create async engine with PostgreSQL
# ✅ Added connect_args={"ssl": "require"} for Neon compatibility
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to False in production
    future=True,
    connect_args={"ssl": "require"}  # Magic fix for Neon + asyncpg
)

# Create session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Create base class for models
Base = declarative_base()

# Dependency to get DB session
async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()