import onnxruntime as ort
import numpy as np
from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("onnx_export")
sess = ort.InferenceSession("onnx_export/model_int8.onnx")

print("Model inputs expected:", [i.name for i in sess.get_inputs()])
print("Model outputs:", [o.name for o in sess.get_outputs()])

text = "Tensions escalate as sanctions target key exports"
inputs = tok(text, return_tensors="np")

onnx_input_names = [i.name for i in sess.get_inputs()]
onnx_inputs = {k: v.astype(np.int64) for k, v in inputs.items() if k in onnx_input_names}

outputs = sess.run(None, onnx_inputs)
last_hidden_state = outputs[0]
print("Full output shape:", last_hidden_state.shape)

cls_embedding = last_hidden_state[:, 0, :]
print("CLS embedding shape:", cls_embedding.shape)
print("First 5 values:", cls_embedding[0][:5])