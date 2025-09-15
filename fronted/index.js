const container = document.getElementById("container");
const searchBtn = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search input");

// Reusable function to render products
function renderProducts(products) {
  container.innerHTML = ""; // clear container

  if (products.length === 0) {
    container.innerHTML = "<p>No products found</p>";
    return;
  }

  products.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("card");

    // Image
    const image = document.createElement("div");
    image.classList.add("image");
    const img = document.createElement("img");
    img.src = item.thumbnail;
    image.appendChild(img);

    // Text
    const text = document.createElement("div");
    text.classList.add("text");

    // Title + Rating
    const topRow = document.createElement("div");
    const title = document.createElement("div");
    title.classList.add("title");
    title.textContent = item.title;

    const rating = document.createElement("div");
    rating.classList.add("rating");
    rating.textContent = item.rating ? `⭐ ${item.rating}` : "⭐ 4.5";

    topRow.appendChild(title);
    topRow.appendChild(rating);

    // Price + Discount
    const bottomRow = document.createElement("div");
    const price = document.createElement("div");
    price.classList.add("price");
    price.textContent = `$${item.price}`;

    const discount = document.createElement("div");
    discount.classList.add("discount");
    const discountedPrice = ((100 - (item.discountPercentage || 0)) * item.price) / 100;
    discount.textContent = item.discountPercentage ? `$${discountedPrice.toFixed(2)}` : "No discount";

    bottomRow.appendChild(price);
    bottomRow.appendChild(discount);

    text.appendChild(topRow);
    text.appendChild(bottomRow);

    card.appendChild(image);
    card.appendChild(text);

    // Click card to go to detail page
    card.addEventListener("click", () => {
      window.location.href = `detail.html?id=${item.id}`;
    });

    container.appendChild(card);
  });
}

// Initial fetch: display all products
fetch("http://localhost:3000/products")
  .then(res => res.json())
  .then(data => renderProducts(data))
  .catch(err => {
    console.error("Error fetching products:", err);
    container.innerHTML = "<p>Error loading products</p>";
  });

// Search by category
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    // if input is empty, show all products
    fetch("http://localhost:3000/products")
      .then(res => res.json())
      .then(data => renderProducts(data))
      .catch(err => console.error(err));
    return;
  }

  fetch("http://localhost:3000/products")
    .then(res => res.json())
    .then(products => {
      const filtered = products.filter(p =>
        p.category.toLowerCase().includes(query) // partial match
      );
      renderProducts(filtered);
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = "<p>Error fetching products</p>";
    });
});

const sortSelect = document.getElementById("sort-select");
let allProducts = []; // store fetched products globally

// Fetch products initially
fetch("http://localhost:3000/products")
  .then(res => res.json())
  .then(data => {
    allProducts = data; // store globally
    renderProducts(allProducts);
  })
  .catch(err => {
    console.error("Error fetching products:", err);
    container.innerHTML = "<p>Error loading products</p>";
  });

// Sorting function
function sortProducts(products, criteria) {
  const sorted = [...products];
  switch(criteria) {
    case "price-asc":
      sorted.sort((a,b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a,b) => b.price - a.price);
      break;
    case "rating-desc":
      sorted.sort((a,b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "discount-desc":
      sorted.sort((a,b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
      break;
    default:
      return products;
  }
  return sorted;
}

// Event listener for sorting
sortSelect.addEventListener("change", () => {
  const criteria = sortSelect.value;
  const filteredProducts = sortProducts(allProducts, criteria);
  renderProducts(filteredProducts);
});

// Search functionality (updates filtered products globally)
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = allProducts.filter(p => p.category.toLowerCase().includes(query));
  renderProducts(filtered);
});

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// const container = document.getElementById("container");
const pagination = document.getElementById("pagination");

let products = [];
let currentPage = 1;
const itemsPerPage = 10;

// Fetch products
fetch("http://localhost:3000/products")
  .then(res => res.json())
  .then(data => {
    products = data;
    renderProducts();
    renderPagination();
  })
  .catch(err => console.error("Error fetching products:", err));

// Render products for current page
function renderProducts() {
  container.innerHTML = "";
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedProducts = products.slice(start, end);

  paginatedProducts.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="image"><img src="${item.thumbnail}" alt="${item.title}" /></div>
      <div class="text">
        <div class="title">${item.title}</div>
        <div class="rating">⭐ ${item.rating}</div>
        <div class="price">$${item.price}</div>
      </div>
    `;

    // Click to detail page
    card.addEventListener("click", () => {
      window.location.href = `detail.html?id=${item.id}`;
    });

    container.appendChild(card);
  });
}

// Render pagination buttons
function renderPagination() {
  pagination.innerHTML = "";
  const totalPages = Math.ceil(products.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentPage = i;
      renderProducts();
      renderPagination();
    });

    pagination.appendChild(btn);
  }
}
