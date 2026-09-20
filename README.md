# 🧠 Emotion Prediction

### NLP-Based Emotion Detection Using Deep Learning

Emotion Prediction is a Natural Language Processing (NLP) and Deep Learning project that analyzes text and predicts the emotion expressed in it. The system is built using recurrent neural networks and compares multiple architectures including **Simple RNN, LSTM, GRU, and Bidirectional GRU (BiGRU)** to identify the best-performing model.

The final application includes an interactive web interface where users can enter a sentence and receive the predicted emotion along with confidence scores and a probability breakdown.

---

## ✨ Features

* 🧠 Emotion classification from text
* 🔤 NLP preprocessing and tokenization
* 🤖 Comparison of RNN, LSTM, GRU & BiGRU models
* 🚀 High-performing Bidirectional GRU model
* 📊 Confusion matrix evaluation
* 🎯 Confidence-based predictions
* 🌐 Interactive web interface
* 💾 Saved trained model & tokenizer
* ⚖️ Class-weight handling for imbalanced data
* ⏱️ Early stopping during training

---

## 🔄 Project Workflow

```text
                 User Input
                     │
                     ▼
            Text Preprocessing
                     │
                     ▼
               Tokenization
                     │
                     ▼
          Sequence Conversion
                     │
                     ▼
         Padding / Truncation
                     │
                     ▼
             Embedding Layer
                     │
                     ▼
          Bidirectional GRU
                     │
                     ▼
             Dense + Softmax
                     │
                     ▼
          Predicted Emotion
```

---

## 📚 Dataset

The project uses the **Emotion Dataset** provided by **dair-ai/emotion** through Hugging Face.

The dataset contains thousands of labeled text samples representing six different human emotions:

* 😄 Joy
* 😢 Sadness
* 😠 Anger
* 😨 Fear
* ❤️ Love
* 😲 Surprise

The data is split into separate training and testing sets for model development and evaluation.

---

## 🤖 Models Compared

| Model      | Purpose                                              |
| ---------- | ---------------------------------------------------- |
| Simple RNN | Baseline recurrent neural network                    |
| LSTM       | Learns long-term contextual information              |
| GRU        | Lightweight gated recurrent architecture             |
| **BiGRU**  | Processes text in both forward & backward directions |

The BiGRU model was selected as the final model due to its superior performance.

---

## 📈 Model Performance

| Model      | Test Accuracy |
| ---------- | ------------: |
| Simple RNN |    **11.15%** |
| LSTM       |    **90.25%** |
| GRU        |     **8.45%** |
| **BiGRU**  |    **91.80%** |

> **Best Model:** Bidirectional GRU (BiGRU)

---

## 🧩 BiGRU Architecture

```text
Embedding Layer (300 Dimensions)
            │
            ▼
 Bidirectional GRU (128)
            │
            ▼
      Dropout (0.5)
            │
            ▼
 Bidirectional GRU (64)
            │
            ▼
      Dropout (0.5)
            │
            ▼
 Dense Layer (Softmax)
            │
            ▼
     Emotion Prediction
```

### Training Configuration

* **Optimizer:** Adam
* **Loss Function:** Sparse Categorical Crossentropy
* **Sequence Length:** 50
* **Vocabulary Size:** 10,000
* **Dropout:** 0.5
* **Early Stopping:** Enabled

---

## 🌐 Web Interface

The project includes a modern web interface that allows users to analyze emotions in real time.

### Features

* Enter any sentence
* Detect dominant emotion
* Display confidence percentage
* Show probability distribution
* Responsive UI with interactive animations

---

## 📁 Project Structure

```text
Emotion-Prediction/
│
├── Artifacts/
│   ├── BiGRU_Model.keras
│   └── tokenizer.pkl
│
├── static/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── final_.ipynb
├── main.py
├── requirements.txt
├── .gitignore
└── README.md
```

---

## 🛠️ Technologies Used

### Programming

* Python
* HTML
* CSS
* JavaScript

### Machine Learning

* TensorFlow
* Keras
* Scikit-learn
* NumPy
* Pandas

### NLP

* Hugging Face Datasets
* Tokenizer
* Sequence Padding
* Text Classification

### Visualization

* Matplotlib
* Seaborn

### Development Tools

* Jupyter Notebook
* VS Code
* Git & GitHub

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/moinmulla2007-helloworld/Emotion-Prediction.git
cd Emotion-Prediction
```

### Create a virtual environment

```bash
python -m venv env
```

### Activate it (Windows)

```bash
env\Scripts\activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```text
HF_TOKEN=your_huggingface_token
```

Load it in Python:

```python
from dotenv import load_dotenv
import os

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
```

> **Important:** Never upload your `.env` file or Hugging Face token to GitHub.

---

## ▶️ Run the Application

Start the application:

```bash
python main.py
```

Open the local URL displayed in your terminal to access the web interface.

---

## 📊 Evaluation

The project evaluates the trained BiGRU model using:

* Confusion Matrix
* Accuracy Score
* Sample Emotion Predictions
* Confidence Probability Distribution

These metrics help compare different recurrent neural network architectures and validate model performance.

---

## 💾 Saved Model

The trained model and tokenizer are stored inside the `Artifacts` directory.

| File                | Description                         |
| ------------------- | ----------------------------------- |
| `BiGRU_Model.keras` | Trained Bidirectional GRU model     |
| `tokenizer.pkl`     | Tokenizer used during preprocessing |

These files are loaded by the application for real-time predictions.

---

## 🚀 Future Improvements

* Create a dedicated validation dataset
* Hyperparameter optimization
* Use pretrained word embeddings (GloVe/BERT)
* Add Precision, Recall & F1-score
* Deploy using Flask or FastAPI
* Cloud deployment (Render / Hugging Face Spaces)
* REST API for external applications
* Dark mode and enhanced UI

---

## ⚠️ Disclaimer

This project predicts emotions from textual content using machine learning. The predictions are based on learned linguistic patterns and should not be considered a definitive assessment of a person's emotional or psychological state.

---

## 👨‍💻 Author

**Mohd Moin Mazhar Mulla**

Second-Year Engineering Student | NLP & Deep Learning Enthusiast

GitHub: https://github.com/moinmulla2007-helloworld

---

### ⭐ If you found this project helpful, consider giving it a Star on GitHub!
