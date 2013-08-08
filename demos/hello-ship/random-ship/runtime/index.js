/* vim: tabstop=2 expandtab */

if (!navigator.hail) {
  location.href = 'runtime.htm' + location.hash;
} else {
  location.href = 'content.htm' + location.hash;
}

