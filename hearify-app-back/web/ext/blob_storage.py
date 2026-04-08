from azure.storage.blob import BlobServiceClient
from fastapi import Form, UploadFile, File, HTTPException
from core import config

storage_account_key = config.STORAGE_ACCOUNT_KEY
storage_account_name = 'hearifyproduct'
connection_string = config.CONNECTION_STRING
container_name = 'images'

def create_upload_photo(name: str = Form(...), file: UploadFile = File(...)):
    if not file:
            return {"status": 400,"message": "No upload file sent"}
    else:
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=name)

        try:
            contents = file.file.read()
            file.file.seek(0)
            blob_client.upload_blob(contents)
        except Exception:
            raise HTTPException(status_code=500, detail='Something went wrong')
        finally:
            file.file.close()

        return {
            "status": 200,
            "message": "File uploaded successfully to Azure Cloud"
        }

def delete_previous_blob(name: str):
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    blob_client = blob_service_client.get_blob_client(container=container_name, blob=name)

    try:
        blob_client.delete_blob()
    except Exception:
        raise HTTPException(status_code=500, detail='Something went wrong')

    return {
        "status": 200,
        "message": "Previous file deleted successfully from Azure Cloud"
    }

def parse_name_from_url(url: str):
    return url[52::]