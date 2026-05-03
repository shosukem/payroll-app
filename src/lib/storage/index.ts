import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const CONTAINER_NAME =
  process.env.AZURE_STORAGE_CONTAINER || "employee-files";

let blobServiceClient: BlobServiceClient | null = null;
let containerClient: ContainerClient | null = null;
let containerEnsured = false;

function buildBlobServiceClient(): BlobServiceClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (connectionString) {
    return BlobServiceClient.fromConnectionString(connectionString);
  }

  const account = process.env.AZURE_STORAGE_ACCOUNT;
  if (!account) {
    throw new Error(
      "Storage is not configured. Set AZURE_STORAGE_ACCOUNT (Managed Identity) or AZURE_STORAGE_CONNECTION_STRING."
    );
  }

  // Managed Identity in production; falls back to az login / env credentials locally
  const credential = new DefaultAzureCredential();
  return new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    credential
  );
}

export async function getEmployeeFilesContainer(): Promise<ContainerClient> {
  if (!blobServiceClient) {
    blobServiceClient = buildBlobServiceClient();
  }
  if (!containerClient) {
    containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  }
  if (!containerEnsured) {
    await containerClient.createIfNotExists();
    containerEnsured = true;
  }
  return containerClient;
}

export function buildEmployeeBlobName(
  employeeId: number,
  originalFileName: string
): string {
  const ext = originalFileName.includes(".")
    ? originalFileName.slice(originalFileName.lastIndexOf("."))
    : "";
  const stamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  return `employees/${employeeId}/${stamp}-${random}${ext}`;
}
