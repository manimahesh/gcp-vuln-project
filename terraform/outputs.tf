output "cluster_name" {
  value = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  value = google_container_cluster.primary.endpoint
}

output "artifact_registry_repo" {
  value = google_artifact_registry_repository.repo.name
}

output "ssrf_function_url" {
  value = google_cloudfunctions_function.ssrf_function.https_trigger_url
}

output "vulnerable_bucket_url" {
  value = google_storage_bucket.vulnerable_bucket.url
}
