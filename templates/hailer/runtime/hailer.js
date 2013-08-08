/* vim: tabstop=2 expandtab */

if (!navigator.hail) {
  parent.document.title = document.title;
  location.hash = parent.location.hash;
  navigator.hail = function(aServiceUri) {
    return parent.hail(aServiceUri);
  }
}

