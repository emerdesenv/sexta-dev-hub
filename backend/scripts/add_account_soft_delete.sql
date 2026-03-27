SET @has_deleted_at := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user'
      AND COLUMN_NAME = 'deleted_at'
);

SET @sql := IF(
    @has_deleted_at = 0,
    'ALTER TABLE user ADD COLUMN deleted_at DATETIME NULL AFTER locked_until',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_purge_after := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user'
      AND COLUMN_NAME = 'purge_after'
);

SET @sql := IF(
    @has_purge_after = 0,
    'ALTER TABLE user ADD COLUMN purge_after DATETIME NULL AFTER deleted_at',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
