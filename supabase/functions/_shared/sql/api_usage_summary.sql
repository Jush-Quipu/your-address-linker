
-- This is a reference for a stored procedure we need to create in Supabase via SQL
-- It calculates summary statistics for API usage
CREATE OR REPLACE FUNCTION api_usage_summary(app_id_param TEXT, time_interval TEXT)
RETURNS TABLE(
  total_requests BIGINT,
  success_count BIGINT,
  error_count BIGINT,
  avg_response_time NUMERIC
) 
LANGUAGE SQL
AS $$
  WITH usage_data AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE response_status >= 200 AND response_status < 300) AS success,
      COUNT(*) FILTER (WHERE response_status >= 400) AS error,
      AVG(execution_time_ms) AS avg_time
    FROM developer_api_usage
    WHERE 
      app_id = app_id_param
      AND created_at >= NOW() - (time_interval::INTERVAL)
  )
  SELECT
    total AS total_requests,
    success AS success_count,
    error AS error_count,
    COALESCE(avg_time, 0) AS avg_response_time
  FROM usage_data;
$$;
