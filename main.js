const PRODUCT_API_URL = 'https://api.escuelajs.co/api/v1/products';
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;

// Khởi chạy khi load trang
window.onload = function () {
    getAllProducts();
}

// 1. Hàm getall của bảng quản lý (Fetch Data)
// 1. Hàm getall của bảng quản lý (Fetch Data)
function getAllProducts() {
    console.log("Start fetching products from:", PRODUCT_API_URL);
    const tbody = document.getElementById('product-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Đang tải dữ liệu...</td></tr>';

    fetch(PRODUCT_API_URL)
        .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Đọc text trước để debug nếu JSON lỗi
            return response.text();
        })
        .then(text => {
            console.log("Raw response length:", text.length);
            // console.log("Raw response (start):", text.substring(0, 100)); // Log 100 ký tự đầu

            try {
                const data = JSON.parse(text);
                console.log("Parsed JSON:", data);

                if (!Array.isArray(data)) {
                    throw new Error("API response không phải là một danh sách (Array)");
                }

                console.log("Data loaded, count:", data.length);
                allProducts = data;
                filteredProducts = [...allProducts];
                renderTable();
            } catch (e) {
                throw new Error("Lỗi xử lý dữ liệu: " + e.message);
            }
        })
        .catch(error => {
            console.error('Error in getAllProducts:', error);
            alert(`Lỗi: ${error.message}\nĐang chuyển sang dữ liệu mẫu để bạn kiểm tra giao diện.`);

            // Fallback Data
            allProducts = [
                {
                    id: 1,
                    title: "Áo Thun Basic (Demo)",
                    price: 150,
                    category: { name: "Quần áo" },
                    images: ["https://placehold.co/200x200?text=Ao+Thun"]
                },
                {
                    id: 2,
                    title: "Giày Thể Thao (Demo)",
                    price: 300,
                    category: { name: "Giày dép" },
                    images: ["https://placehold.co/200x200?text=Giay"]
                },
                {
                    id: 3,
                    title: "Mũ Lưỡi Trai (Demo)",
                    price: 75,
                    category: { name: "Phụ kiện" },
                    images: ["https://placehold.co/200x200?text=Mu"]
                }
            ];
            filteredProducts = [...allProducts];
            renderTable();
        });
}

// 2. Render Table Function
function renderTable() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = filteredProducts.slice(start, end);

    const tbody = document.getElementById('product-table-body');
    if (!tbody) return; // Kiểm tra nếu không tìm thấy bảng (trường hợp chạy file cũ)

    tbody.innerHTML = '';

    paginatedItems.forEach(product => {
        let imageUrl = '';

        // Helper làm sạch URL
        const cleanImageUrl = (img) => {
            if (!img) return '';
            if (typeof img !== 'string') return '';

            // Loại bỏ các ký tự thừa phổ biến trong API này
            let clean = img.replace(/^[\["]+|[\]"]+$/g, '');

            // Xử lý trường hợp double encoded json
            try {
                if (clean.startsWith('http') || clean.startsWith('https')) return clean;
                const parsed = JSON.parse(clean);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
                return clean;
            } catch (e) {
                return clean;
            }
        };

        if (Array.isArray(product.images) && product.images.length > 0) {
            imageUrl = cleanImageUrl(product.images[0]);
        } else if (typeof product.images === 'string') {
            imageUrl = cleanImageUrl(product.images);
        }

        // Nếu URL không hợp lệ ngay từ đầu (không bắt đầu bằng http), dùng ảnh default ngay
        if (!imageUrl || !imageUrl.startsWith('http')) {
            imageUrl = `https://picsum.photos/200?random=${product.id}`;
        }

        // Tailwind Classes:
        // odd:bg-black odd:text-white: Dòng lẻ nền đen chữ trắng
        // even:bg-white even:text-black: Dòng chẵn nền trắng chữ đen
        const rowClass = "odd:bg-black odd:text-white even:bg-white even:text-black border-b border-gray-200 hover:opacity-90 transition-opacity duration-200";
        const cellClass = "p-3 border border-gray-300";

        const row = `
            <tr class="${rowClass}">
                <td class="${cellClass}">${product.id}</td>
                <td class="${cellClass}">
                    <img src="${imageUrl}" alt="${product.title}" 
                         class="w-20 h-20 object-contain bg-white rounded border border-gray-400 mx-auto"
                         onerror="this.onerror=null; this.src='https://picsum.photos/200?random=${product.id}';">
                </td>
                <td class="${cellClass} font-medium">${product.title}</td>
                <td class="${cellClass}">$${product.price}</td>
                <td class="${cellClass}">${product.category ? product.category.name : 'N/A'}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    updatePaginationInfo();
}

// 3. Tìm kiếm theo title (onChange/onInput)
function handleSearch(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredProducts = allProducts.filter(p =>
        p.title.toLowerCase().includes(lowerKeyword)
    );
    currentPage = 1; // Reset về trang 1 khi search
    renderTable();
}

// 4. Sắp xếp (Sort)
function handleSort(key, direction) {
    // direction: 'asc' or 'desc'
    filteredProducts.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    renderTable();
}

// 5. Phân trang (Pagination)
function changePageSize(size) {
    pageSize = parseInt(size);
    currentPage = 1;
    renderTable();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const maxPage = Math.ceil(filteredProducts.length / pageSize);
    if (currentPage < maxPage) {
        currentPage++;
        renderTable();
    }
}

function updatePaginationInfo() {
    const maxPage = Math.ceil(filteredProducts.length / pageSize);
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.innerText = `Trang ${currentPage} / ${maxPage || 1}`;
    }
}
