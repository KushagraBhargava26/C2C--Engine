import onnxruntime as ort
import numpy as np
from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("onnx_export_clf")
sess = ort.InferenceSession("onnx_export_clf/model_int8.onnx")

print("Model inputs expected:", [i.name for i in sess.get_inputs()])
print("Model outputs:", [o.name for o in sess.get_outputs()])

text = "Tensions escalate as sanctions target key exports"
inputs = tok(text, return_tensors="np")

onnx_input_names = [i.name for i in sess.get_inputs()]
onnx_inputs = {k: v.astype(np.int64) for k, v in inputs.items() if k in onnx_input_names}

outputs = sess.run(None, onnx_inputs)
for name, out in zip([o.name for o in sess.get_outputs()], outputs):
    print(f"{name}: shape={out.shape}")

logits = outputs[[o.name for o in sess.get_outputs()].index("logits")]
print("Logits:", logits)

id2label = {0: "positive", 1: "negative", 2: "neutral"}
probs = np.exp(logits) / np.exp(logits).sum(axis=-1, keepdims=True)
pred_idx = int(np.argmax(probs, axis=-1)[0])
print(f"Predicted label: {id2label[pred_idx]}, confidence: {probs[0][pred_idx]:.4f}")