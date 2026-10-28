from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Text,
    Index,
    UniqueConstraint,
    func,
)
from .session import Base


class HistoricalTrade(Base):
    """Canonical historical spread trades imported from validated walk-forward backtest logs."""
    __tablename__ = "historical_trades"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trade_key = Column(String(64), unique=True, index=True, nullable=False)
    pair = Column(String(64), nullable=False, index=True)
    expiry_date = Column(String(16), nullable=False)
    entry_date = Column(String(16), nullable=False, index=True)
    exit_date = Column(String(16), nullable=False, index=True)
    direction = Column(String(32), nullable=False)
    entry_z = Column(Float, nullable=False)
    exit_z = Column(Float, nullable=False)
    holding_observations = Column(Integer, nullable=False)
    entry_log_spread = Column(Float, nullable=False)
    exit_log_spread = Column(Float, nullable=False)
    gross_spread_change_pct = Column(Float, nullable=False)
    estimated_cost_pct = Column(Float, nullable=False)
    net_spread_change_pct = Column(Float, nullable=False)
    exit_reason = Column(String(32), nullable=False, index=True)
    raw_row_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_trade_pair_dates", "pair", "entry_date", "exit_date"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "tradeKey": self.trade_key,
            "pair": self.pair,
            "expiryDate": self.expiry_date,
            "entryDate": self.entry_date,
            "exitDate": self.exit_date,
            "direction": self.direction,
            "entryZ": round(self.entry_z, 6),
            "exitZ": round(self.exit_z, 6),
            "holdingObservations": self.holding_observations,
            "entryLogSpread": self.entry_log_spread,
            "exitLogSpread": self.exit_log_spread,
            "grossSpreadChangePct": self.gross_spread_change_pct,
            "estimatedCostPct": self.estimated_cost_pct,
            "netReturnPct": round(self.net_spread_change_pct, 7),
            "exitReason": self.exit_reason,
            "status": "Closed",
        }


class PairSummary(Base):
    """Reproducible aggregate metrics for each spread pair computed directly from canonical trades."""
    __tablename__ = "pair_summaries"

    pair = Column(String(64), primary_key=True)
    trades = Column(Integer, nullable=False)
    win_rate_pct = Column(Float, nullable=False)
    total_net_return_pct = Column(Float, nullable=False)
    mean_net_return_pct = Column(Float, nullable=False)
    max_drawdown_pct = Column(Float, nullable=False)
    mean_reversion_exits = Column(Integer, default=0, nullable=False)
    stop_loss_exits = Column(Integer, default=0, nullable=False)
    expiry_buffer_exits = Column(Integer, default=0, nullable=False)
    max_holding_exits = Column(Integer, default=0, nullable=False)
    end_of_segment_exits = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "pair": self.pair,
            "trades": self.trades,
            "winRatePct": round(self.win_rate_pct, 6),
            "totalNetReturnPct": round(self.total_net_return_pct, 6),
            "meanNetReturnPct": round(self.mean_net_return_pct, 6),
            "maxDrawdownPct": round(self.max_drawdown_pct, 6),
            "meanReversionExits": self.mean_reversion_exits,
            "stopLossExits": self.stop_loss_exits,
            "expiryBufferExits": self.expiry_buffer_exits,
            "maxHoldingExits": self.max_holding_exits,
            "endOfSegmentExits": self.end_of_segment_exits,
        }


class DataImport(Base):
    """Audit ledger recording data import runs, hashes, row counts, and validation status."""
    __tablename__ = "data_imports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_file = Column(String(255), nullable=False)
    file_sha256 = Column(String(64), nullable=False, index=True)
    row_count = Column(Integer, nullable=False)
    pair_count = Column(Integer, nullable=False)
    validation_status = Column(String(32), nullable=False)
    data_mode = Column(String(64), default="historical_backtest", nullable=False)
    imported_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    notes = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "sourceFile": self.source_file,
            "fileSHA256": self.file_sha256,
            "rowCount": self.row_count,
            "pairCount": self.pair_count,
            "validationStatus": self.validation_status,
            "dataMode": self.data_mode,
            "importedAt": self.imported_at.isoformat() if self.imported_at else None,
            "notes": self.notes,
        }


class ValidationRun(Base):
    """Audit log of validation runs and guard checks against backtest rules."""
    __tablename__ = "validation_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(32), nullable=False)
    trade_count = Column(Integer, nullable=False)
    pair_count = Column(Integer, nullable=False)
    report_json = Column(Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "runAt": self.run_at.isoformat() if self.run_at else None,
            "status": self.status,
            "tradeCount": self.trade_count,
            "pairCount": self.pair_count,
            "reportJson": self.report_json,
        }
