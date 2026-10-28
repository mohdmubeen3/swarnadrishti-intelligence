"""Initial schema for SwarnaDrishti persistence

Revision ID: 6cfb9e643a75
Revises: 
Create Date: 2026-10-28 15:06:32.070188
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '6cfb9e643a75'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Pair Summaries
    op.create_table(
        'pair_summaries',
        sa.Column('pair', sa.String(length=64), primary_key=True, nullable=False),
        sa.Column('trades', sa.Integer(), nullable=False),
        sa.Column('win_rate_pct', sa.Float(), nullable=False),
        sa.Column('total_net_return_pct', sa.Float(), nullable=False),
        sa.Column('mean_net_return_pct', sa.Float(), nullable=False),
        sa.Column('max_drawdown_pct', sa.Float(), nullable=False),
        sa.Column('mean_reversion_exits', sa.Integer(), server_default='0', nullable=False),
        sa.Column('stop_loss_exits', sa.Integer(), server_default='0', nullable=False),
        sa.Column('expiry_buffer_exits', sa.Integer(), server_default='0', nullable=False),
        sa.Column('max_holding_exits', sa.Integer(), server_default='0', nullable=False),
        sa.Column('end_of_segment_exits', sa.Integer(), server_default='0', nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 2. Historical Trades
    op.create_table(
        'historical_trades',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('trade_key', sa.String(length=64), unique=True, nullable=False),
        sa.Column('pair', sa.String(length=64), nullable=False),
        sa.Column('expiry_date', sa.String(length=16), nullable=False),
        sa.Column('entry_date', sa.String(length=16), nullable=False),
        sa.Column('exit_date', sa.String(length=16), nullable=False),
        sa.Column('direction', sa.String(length=32), nullable=False),
        sa.Column('entry_z', sa.Float(), nullable=False),
        sa.Column('exit_z', sa.Float(), nullable=False),
        sa.Column('holding_observations', sa.Integer(), nullable=False),
        sa.Column('entry_log_spread', sa.Float(), nullable=False),
        sa.Column('exit_log_spread', sa.Float(), nullable=False),
        sa.Column('gross_spread_change_pct', sa.Float(), nullable=False),
        sa.Column('estimated_cost_pct', sa.Float(), nullable=False),
        sa.Column('net_spread_change_pct', sa.Float(), nullable=False),
        sa.Column('exit_reason', sa.String(length=32), nullable=False),
        sa.Column('raw_row_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_historical_trades_trade_key', 'historical_trades', ['trade_key'], unique=True)
    op.create_index('ix_historical_trades_pair', 'historical_trades', ['pair'])
    op.create_index('ix_historical_trades_entry_date', 'historical_trades', ['entry_date'])
    op.create_index('ix_historical_trades_exit_date', 'historical_trades', ['exit_date'])
    op.create_index('ix_historical_trades_exit_reason', 'historical_trades', ['exit_reason'])
    op.create_index('idx_trade_pair_dates', 'historical_trades', ['pair', 'entry_date', 'exit_date'])

    # 3. Data Imports
    op.create_table(
        'data_imports',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('source_file', sa.String(length=255), nullable=False),
        sa.Column('file_sha256', sa.String(length=64), nullable=False),
        sa.Column('row_count', sa.Integer(), nullable=False),
        sa.Column('pair_count', sa.Integer(), nullable=False),
        sa.Column('validation_status', sa.String(length=32), nullable=False),
        sa.Column('data_mode', sa.String(length=64), server_default='historical_backtest', nullable=False),
        sa.Column('imported_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
    )
    op.create_index('ix_data_imports_file_sha256', 'data_imports', ['file_sha256'])

    # 4. Validation Runs
    op.create_table(
        'validation_runs',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('run_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('trade_count', sa.Integer(), nullable=False),
        sa.Column('pair_count', sa.Integer(), nullable=False),
        sa.Column('report_json', sa.Text(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('validation_runs')
    op.drop_table('data_imports')
    op.drop_table('historical_trades')
    op.drop_table('pair_summaries')
