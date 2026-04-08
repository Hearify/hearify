from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter


class PDFProcessing:
    def __init__(self, path):
        self.text = ""
        self.pages = []
        self.path = path
        self.split_text = []

    def read(self):
        with open(self.path, "rb") as f:
            pdf = PdfReader(f)
            self.text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text is not None:
                    self.text += text

    def split(self):
        splitter = CharacterTextSplitter(
            separator=" ",
            chunk_size=2000,
            chunk_overlap=200,
            length_function=len,
        )
        self.split_text = splitter.split_text(self.text)

    def get_texts(self):
        return self.split_text

    def __str__(self):
        return f"PDFProcessing(path={self.path}, texts={self.pages})"

    def __repr__(self):
        return f"PDFProcessing(path={self.path}, texts={self.pages})"

    def __eq__(self, other):
        if isinstance(other, PDFProcessing):
            return self.path == other.path and self.text == other.text and self.split_text == other.split_text
        return False
