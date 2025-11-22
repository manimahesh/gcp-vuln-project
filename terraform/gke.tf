resource "google_container_cluster" "primary" {
  name     = "vuln-app-cluster"
  location = var.zone

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name
  
  resource_labels = {
    owner = "pan"
  }
}

resource "google_service_account" "gke_sa" {
  account_id   = "vuln-app-gke-sa"
  display_name = "GKE Service Account"
}

resource "google_container_node_pool" "primary_preemptible_nodes" {
  name       = "vuln-app-node-pool"
  location   = var.zone
  cluster    = google_container_cluster.primary.name
  node_count = 1

  node_config {
    preemptible  = true
    machine_type = "e2-medium"

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = google_service_account.gke_sa.email
    oauth_scopes    = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
    
    labels = {
      owner = "pan"
    }
  }
}
