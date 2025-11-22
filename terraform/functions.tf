# Cloud Function for SSRF (Vulnerability #3)

resource "google_storage_bucket" "function_bucket" {
  name     = "${var.project_id}-function-source"
  location = var.region
  force_destroy = true
  
  labels = {
    owner = "pan"
  }
}

resource "google_storage_bucket_object" "archive" {
  name   = "source.zip"
  bucket = google_storage_bucket.function_bucket.name
  source = "${path.module}/function-source.zip"
}

resource "google_cloudfunctions_function" "ssrf_function" {
  name        = "ssrf-demo-function"
  description = "Vulnerable Function for SSRF"
  runtime     = "nodejs20"

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.function_bucket.name
  source_archive_object = google_storage_bucket_object.archive.name
  trigger_http          = true
  entry_point           = "fetchUrl"
  
  labels = {
    owner = "pan"
  }
  
  environment_variables = {
    PROJECT_ID = var.project_id
  }
  
  depends_on = [google_project_service.apis]
}

# IAM entry for all users to invoke the function (if we want it public)
resource "google_cloudfunctions_function_iam_member" "invoker" {
  project        = google_cloudfunctions_function.ssrf_function.project
  region         = google_cloudfunctions_function.ssrf_function.region
  cloud_function = google_cloudfunctions_function.ssrf_function.name

  role   = "roles/cloudfunctions.invoker"
  member = "allUsers"
}
