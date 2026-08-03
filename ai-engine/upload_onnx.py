from huggingface_hub import HfApi

api = HfApi()
repo_id = "Kushhhie/c2c-finbert-onnx"

# Embedding model (feature-extraction export)
api.upload_file(
    path_or_fileobj="onnx_export/model_int8.onnx",
    path_in_repo="embedding/model_int8.onnx",
    repo_id=repo_id,
)

# Classification model (text-classification export)
api.upload_file(
    path_or_fileobj="onnx_export_clf/model_int8.onnx",
    path_in_repo="classification/model_int8.onnx",
    repo_id=repo_id,
)

# Tokenizer files (identical between the two exports, only need one copy)
for fname in ["tokenizer.json", "tokenizer_config.json", "vocab.txt", "special_tokens_map.json"]:
    api.upload_file(
        path_or_fileobj=f"onnx_export_clf/{fname}",
        path_in_repo=fname,
        repo_id=repo_id,
    )

print("Upload complete.")