class IndexdbAPI {
  private static dbName = 'fileStorageDB';

  private static storeName = 'files';

  private static initDB = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IndexdbAPI.dbName, 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(IndexdbAPI.storeName)) {
          db.createObjectStore(IndexdbAPI.storeName, { keyPath: 'name' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject();
      };
    });
  };

  public static uploadFile = async (name: string, file: File): Promise<void> => {
    const db = await IndexdbAPI.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IndexdbAPI.storeName, 'readwrite');
      const store = transaction.objectStore(IndexdbAPI.storeName);

      const fileData = {
        name,
        file,
      };

      const request = store.put(fileData);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject();
      };
    });
  };

  public static getFile = async (name: string): Promise<File | null> => {
    const db = await IndexdbAPI.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IndexdbAPI.storeName, 'readonly');
      const store = transaction.objectStore(IndexdbAPI.storeName);

      const request = store.get(name);

      request.onsuccess = () => {
        if (request.result) {
          const { file } = request.result as { file: File };
          resolve(file);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject();
      };
    });
  };

  public static removeFile = async (name: string): Promise<void> => {
    const db = await IndexdbAPI.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IndexdbAPI.storeName, 'readwrite');
      const store = transaction.objectStore(IndexdbAPI.storeName);

      const request = store.delete(name);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject();
      };
    });
  };
}

export default IndexdbAPI;
