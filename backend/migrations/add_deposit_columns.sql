-- Add deposit and payment columns to Appointments (MenZoneBarber database)
-- Run this once before using the deposit payment flow.

USE MenZoneBarber;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID('Appointments') AND name = 'DepositAmount'
)
BEGIN
  ALTER TABLE Appointments ADD DepositAmount DECIMAL(10,2) NULL;
END
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID('Appointments') AND name = 'DepositStatus'
)
BEGIN
  ALTER TABLE Appointments ADD DepositStatus VARCHAR(20) NULL;
END
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID('Appointments') AND name = 'PaymentTransactionId'
)
BEGIN
  ALTER TABLE Appointments ADD PaymentTransactionId VARCHAR(100) NULL;
END
GO
