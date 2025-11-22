# Artifact Registry
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "vuln-app-repo"
  description   = "Docker repository for Vulnerable App"
  format        = "DOCKER"
  
  labels = {
    owner = "pan"
  }
  
  depends_on = [google_project_service.apis]
}

# Secure Bucket (for general use)
resource "google_storage_bucket" "secure_bucket" {
  name          = "${var.project_id}-secure-bucket"
  location      = var.region
  force_destroy = true
  
  uniform_bucket_level_access = true
  
  labels = {
    owner = "pan"
  }
}

# Vulnerable Bucket (Publicly accessible - Vulnerability #5)
resource "google_storage_bucket" "vulnerable_bucket" {
  name          = "${var.project_id}-vulnerable-public-bucket"
  location      = var.region
  force_destroy = true
  
  uniform_bucket_level_access = true # We will grant public access via IAM
  
  labels = {
    owner = "pan"
  }
}

# Make the vulnerable bucket public
resource "google_storage_bucket_iam_member" "public_access" {
  bucket = google_storage_bucket.vulnerable_bucket.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Upload a "secret" file to the public bucket
resource "google_storage_bucket_object" "secret_file" {
  name   = "secret_config.json"
  bucket = google_storage_bucket.vulnerable_bucket.name
  content = <<EOF
{
  "database_password": "super_secret_password_do_not_share",
  "api_key": "AIzaSyD-fake-api-key-for-demo"
}
EOF
}
