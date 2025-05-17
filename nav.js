document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  navToggle.addEventListener('click', function() {
    navLinks.classList.toggle('active');
    this.classList.toggle('active');
  });
  
  // Close mobile menu when clicking a link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
      }
    });
  });
  
  // Set active link based on current page
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPage = link.getAttribute('href');
    if (currentPage === linkPage) {
      link.classList.add('active');
    }
  });
});