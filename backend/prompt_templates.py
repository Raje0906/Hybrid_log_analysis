"""
Prompt builders for each analysis mode.
All prompts use TinyLlama chat template format.
"""

SYSTEM_ANOMALY = (
    "You are a SOC analyst AI specialized in log anomaly detection. "
    "Analyze the provided log entry and classify it as NORMAL or ANOMALOUS. "
    "If ANOMALOUS, determine the severity (WARNING or CRITICAL). "
    "Respond in this exact format:\n"
    "CLASSIFICATION: <NORMAL|ANOMALOUS>\n"
    "SEVERITY: <NORMAL|WARNING|CRITICAL>\n"
    "REASON: <brief one-line reason>"
)

SYSTEM_RCA = (
    "You are a senior DevOps/SRE engineer specializing in root cause analysis. "
    "Analyze the provided log entry, identify what went wrong, and explain the likely root cause. "
    "Be concise but precise. Format your response as:\n"
    "ISSUE: <what failed>\n"
    "ROOT CAUSE: <why it happened>\n"
    "IMPACT: <affected services or data>\n"
    "RECOMMENDED ACTION: <immediate steps to mitigate>"
)

SYSTEM_NL2SQL = (
    "You are a SQL expert. Convert the natural language question about logs into a valid SQL query. "
    "Assume the table name is 'logs' with columns: "
    "id, timestamp, level, service, host, message, status_code, user_id. "
    "Respond with ONLY the SQL query, no explanation."
)


def build_anomaly_prompt(log_text: str, tokenizer) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_ANOMALY},
        {"role": "user", "content": f"Analyze this log entry:\n\n{log_text}"},
    ]
    return tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )


def build_rca_prompt(log_text: str, tokenizer) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_RCA},
        {"role": "user", "content": f"Perform root cause analysis on this log:\n\n{log_text}"},
    ]
    return tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )


def build_nl2sql_prompt(log_text: str, tokenizer) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_NL2SQL},
        {"role": "user", "content": log_text},
    ]
    return tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )


def build_prompt(mode: str, log_text: str, tokenizer) -> str:
    if mode == "anomaly":
        return build_anomaly_prompt(log_text, tokenizer)
    elif mode == "rca":
        return build_rca_prompt(log_text, tokenizer)
    elif mode == "nl2sql":
        return build_nl2sql_prompt(log_text, tokenizer)
    else:
        raise ValueError(f"Unknown mode: {mode}")


def parse_severity(mode: str, output: str) -> str:
    """Extract severity level from model output."""
    output_upper = output.upper()
    if mode == "nl2sql":
        return "NORMAL"  # SQL queries are always normal severity

    if "SEVERITY: CRITICAL" in output_upper or "CRITICAL" in output_upper:
        return "CRITICAL"
    elif "SEVERITY: WARNING" in output_upper or "WARNING" in output_upper:
        return "WARNING"
    elif "CLASSIFICATION: NORMAL" in output_upper or "SEVERITY: NORMAL" in output_upper:
        return "NORMAL"
    # Fallback heuristics
    if mode == "anomaly" and "ANOMALOUS" in output_upper:
        return "WARNING"
    return "NORMAL"
