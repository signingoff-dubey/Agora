import httpx
import logging

logger = logging.getLogger(__name__)

OLLAMA_HOST = "http://localhost:11434"

AVAILABLE_MODELS = [
    "llama3",
    "mistral",
    "gemma2",
    "phi3",
    "qwen2",
    "deepseek-r1",
    "codellama",
    "mixtral",
    "llama2",
    "orca-mini",
]


def get_installed_models() -> list[str]:
    try:
        response = httpx.get(f"{OLLAMA_HOST}/api/tags", timeout=5.0)
        if response.status_code == 200:
            data = response.json()
            return [model["name"].split(":")[0] for model in data.get("models", [])]
        return []
    except Exception as e:
        logger.warning(f"Could not reach Ollama: {e}")
        return []


def is_ollama_running() -> bool:
    try:
        response = httpx.get(f"{OLLAMA_HOST}/api/tags", timeout=2.0)
        return response.status_code == 200
    except Exception:
        return False


def get_model_discovery():
    installed = get_installed_models()
    available_not_installed = [m for m in AVAILABLE_MODELS if m not in installed]

    return {
        "installed": installed,
        "available": available_not_installed,
        "ollama_running": is_ollama_running(),
    }
