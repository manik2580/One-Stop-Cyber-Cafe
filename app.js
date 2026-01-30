// South Asian Number Formatter (Lakh/Crore format: 1,00,000)
function formatIndianNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "0.00"
  
  const numStr = parseFloat(num).toFixed(2)
  const parts = numStr.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]
  
  // Handle negative numbers
  const isNegative = integerPart.startsWith('-')
  const absInteger = isNegative ? integerPart.slice(1) : integerPart
  
  // Apply Indian numbering: 1,00,000 format
  let formatted = ""
  const reversed = absInteger.split('').reverse()
  
  for (let i = 0; i < reversed.length; i++) {
    if (i === 3 || (i > 3 && (i - 3) % 2 === 0)) {
      formatted = "," + formatted
    }
    formatted = reversed[i] + formatted
  }
  
  const result = (isNegative ? "-" : "") + formatted + "." + decimalPart
  return result
}

// Performance: Debounce helper function
function debounce(func, delay) {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Toast notification function with improved UX
function showToast(message, type = "success", duration = 3000) {
  const container = document.getElementById("toast-container")
  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.setAttribute("role", "alert")
  toast.setAttribute("aria-live", "polite")

  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  }

  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info}" aria-hidden="true"></i>
    <span>${message}</span>
  `

  container.appendChild(toast)

  // Use requestAnimationFrame for smoother animation
  requestAnimationFrame(() => {
    toast.classList.add("show")
  })

  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast)
      }
    }, 300)
  }, duration)
}

// Shop Manager Class
class ShopManager {
  constructor() {
    this.products = []
    this.sales = []
    this.procurements = []
    this.services = []
    this.currentSale = []
    this.currentProcurement = []
    this.currentDiscount = 0
    // </CHANGE>
    this.settings = {
      shopName: "One Stop Cyber Cafe",
      shopAddress: "Joymontop Bazar, Singair, Manikganj",
      shopPhone: "01305681653",
      lowStockThreshold: 10,
      currency: " ",
      darkMode: "light",
    }

    this.init()
  }

  init() {
    this.loadData()
    this.updateUserDisplay()
    this.initializeEventListeners()
    this.updateDateTime()
    this.updateDashboard()
    this.loadInventory()
    this.loadServices()
    this.loadStatements()
    this.initializeDarkMode()
    this.initKeyboardShortcuts()
    this.initCostManagementEventListeners()

    setInterval(() => this.updateDateTime(), 1000)
  }

  updateUserDisplay() {
    const userName = sessionStorage.getItem("userName")
    const userNameElement = document.getElementById("userName")
    if (userName && userNameElement) {
      userNameElement.textContent = userName.charAt(0).toUpperCase() + userName.slice(1)
    }
  }

  initKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + D for Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault()
        this.showSection("dashboard")
      }
      // Ctrl/Cmd + S for Sales
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        this.showSection("sales")
      }
      // Ctrl/Cmd + I for Inventory
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault()
        this.showSection("inventory")
      }
      // Ctrl/Cmd + P for Procurement
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault()
        this.showSection("procurement")
      }
      // ESC for closing modals
      if (e.key === "Escape") {
        const openModal = document.querySelector(".modal[style*='display: block']")
        if (openModal) {
          openModal.style.display = "none"
        }
      }
    })
  }

  initializeDarkMode() {
    const darkModeToggle = document.getElementById("darkModeToggle")
    const darkModePreference = document.getElementById("darkModePreference")

    if (darkModePreference) {
      darkModePreference.value = this.settings.darkMode || "light"
    }

    this.applyTheme(this.settings.darkMode || "light")

    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme")
        const newTheme = currentTheme === "dark" ? "light" : "dark"
        this.settings.darkMode = newTheme
        this.applyTheme(newTheme)
        this.saveData()

        if (darkModePreference) {
          darkModePreference.value = newTheme
        }
      })
    }

    if (darkModePreference) {
      darkModePreference.addEventListener("change", (e) => {
        this.settings.darkMode = e.target.value
        this.applyTheme(e.target.value)
        this.saveData()
      })
    }
  }

  applyTheme(theme) {
    const root = document.documentElement
    const darkModeToggle = document.getElementById("darkModeToggle")

    if (theme === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      theme = prefersDark ? "dark" : "light"
    }

    if (theme === "dark") {
      root.setAttribute("data-theme", "dark")
      if (darkModeToggle) {
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'
        darkModeToggle.title = "Switch to Light Mode"
      }
    } else {
      root.setAttribute("data-theme", "light")
      if (darkModeToggle) {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'
        darkModeToggle.title = "Switch to Dark Mode"
      }
    }
  }

  loadData() {
    const savedProducts = localStorage.getItem("shop_products")
    const savedSales = localStorage.getItem("shop_sales")
    const savedProcurements = localStorage.getItem("shop_procurements")
    const savedServices = localStorage.getItem("shop_services")
    const savedSettings = localStorage.getItem("shop_settings")

    if (savedProducts) this.products = JSON.parse(savedProducts)
    if (savedSales) this.sales = JSON.parse(savedSales)
    if (savedProcurements) this.procurements = JSON.parse(savedProcurements)
    if (savedServices) this.services = JSON.parse(savedServices)
    if (savedSettings) this.settings = { ...this.settings, ...JSON.parse(savedSettings) }
  }

  saveData() {
    try {
      localStorage.setItem("shop_products", JSON.stringify(this.products))
      localStorage.setItem("shop_sales", JSON.stringify(this.sales))
      localStorage.setItem("shop_procurements", JSON.stringify(this.procurements))
      localStorage.setItem("shop_services", JSON.stringify(this.services))
      localStorage.setItem("shop_settings", JSON.stringify(this.settings))
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
      showToast("Error saving data. Please check browser storage.", "error")
    }
  }

  loadSampleData() {
    console.warn("Sample data loading has been removed.")
  }

  resetAllData() {
    localStorage.clear()
    this.products = []
    this.sales = []
    this.procurements = []
    this.services = []
    this.currentSale = []
    this.currentProcurement = []
    this.settings = {
      shopName: "One Stop Cyber Cafe",
      shopAddress: "Joymontop Bazar, Singair, Manikganj",
      shopPhone: "01305681653",
      lowStockThreshold: 10,
      currency: " ",
      darkMode: "light",
    }

    this.updateDashboard()
    this.loadInventory()
    this.loadStatements()
    this.updateCurrencySymbols()
    this.loadServices()
    this.applyTheme("light")
    showToast("All data has been reset successfully!", "success")
  }

  initializeEventListeners() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()
        const section = item.dataset.section
        this.showSection(section)
      })
    })

    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("isLoggedIn")
        showToast("Logged out successfully", "success")
      })
    }

    this.initSalesEventListeners()
    this.initProcurementEventListeners()
    this.initInventoryEventListeners()
    this.initStatementsEventListeners()
    this.initServicesEventListeners()
    this.initSettingsEventListeners()
    this.initModalEventListeners()
  }

  initSalesEventListeners() {
    const productSearch = document.getElementById("productSearch")
    const saleQuantity = document.getElementById("saleQuantity")
    const addToSaleBtn = document.getElementById("addToSale")
    const completeSaleBtn = document.getElementById("completeSale")
    const clearSaleBtn = document.getElementById("clearSale")
    const decreaseQtyBtn = document.getElementById("decreaseQty")
    const increaseQtyBtn = document.getElementById("increaseQty")
    const searchMethods = document.querySelectorAll(".search-method")
    const receivedAmountInput = document.getElementById("receivedAmount")

    const applyDiscountBtn = document.getElementById("applyDiscount")
    const discountAmountInput = document.getElementById("discountAmount")

    applyDiscountBtn.addEventListener("click", () => {
      this.applyDiscount()
    })

    discountAmountInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.applyDiscount()
      }
    })
    // </CHANGE>

    searchMethods.forEach((method) => {
      method.addEventListener("click", () => {
        searchMethods.forEach((m) => m.classList.remove("active"))
        method.classList.add("active")

        const searchType = method.dataset.method
        const searchLabel = document.getElementById("searchMethodLabel")
        const searchInput = document.getElementById("productSearch")

        if (searchType === "name") {
          searchLabel.textContent = "Enter Product Name:"
          searchInput.placeholder = "Type product name to search..."
        } else {
          searchLabel.textContent = "Enter Barcode:"
          searchInput.placeholder = "Scan or type barcode..."
        }

        searchInput.value = ""
        document.getElementById("productSuggestions").style.display = "none"
        document.getElementById("productDetails").style.display = "none"
      })
    })

    // Debounce product search for better performance
    const debouncedSearch = debounce((value) => {
      this.handleEnhancedProductSearch(value, "sales")
    }, 200)
    
    productSearch.addEventListener("input", (e) => {
      debouncedSearch(e.target.value)
    })

    decreaseQtyBtn.addEventListener("click", () => {
      const currentQty = Number.parseInt(saleQuantity.value) || 1
      if (currentQty > 1) {
        saleQuantity.value = currentQty - 1
        this.updateSaleLineTotal()
      }
    })

    increaseQtyBtn.addEventListener("click", () => {
      const currentQty = Number.parseInt(saleQuantity.value) || 1
      const maxQty = Number.parseInt(saleQuantity.max) || 999
      if (currentQty < maxQty) {
        saleQuantity.value = currentQty + 1
        this.updateSaleLineTotal()
      }
    })

    saleQuantity.addEventListener("input", () => {
      this.updateSaleLineTotal()
    })

    receivedAmountInput.addEventListener("input", () => {
      this.updateChangeCalculation()
    })

    addToSaleBtn.addEventListener("click", () => {
      this.addToCurrentSale()
    })

    completeSaleBtn.addEventListener("click", () => {
      this.completeSale()
    })

    clearSaleBtn.addEventListener("click", () => {
      this.clearCurrentSale()
    })

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("suggestion-item")) {
        const barcode = e.target.dataset.barcode
        const module = e.target.dataset.module
        this.selectProduct(barcode, module)
      }
    })
  }

  initProcurementEventListeners() {
    const procurementSearch = document.getElementById("procurementSearch")
    const addNewProductBtn = document.getElementById("addNewProduct")
    const addToProcurementBtn = document.getElementById("addToProcurement")
    const completeProcurementBtn = document.getElementById("completeProcurement")
    const clearProcurementBtn = document.getElementById("clearProcurement")

    const procurementSearchMethods = document.querySelectorAll('.search-method[data-module="procurement"]')
    procurementSearchMethods.forEach((method) => {
      method.addEventListener("click", () => {
        procurementSearchMethods.forEach((m) => m.classList.remove("active"))
        method.classList.add("active")

        const methodType = method.dataset.method
        const label = document.getElementById("procurementSearchMethodLabel")
        const input = document.getElementById("procurementSearch")

        if (methodType === "name") {
          label.textContent = "Enter Product Name:"
          input.placeholder = "Type product name to search..."
        } else {
          label.textContent = "Enter Barcode:"
          input.placeholder = "Type barcode to search..."
        }

        input.value = ""
        document.getElementById("procurementSuggestions").style.display = "none"
      })
    })

    // Debounce procurement search for better performance
    const debouncedProcSearch = debounce((value) => {
      this.handleProductSearch(value, "procurement")
    }, 200)
    
    procurementSearch.addEventListener("input", (e) => {
      debouncedProcSearch(e.target.value)
    })

    addNewProductBtn.addEventListener("click", () => {
      this.showModal("newProductModal")
      setTimeout(() => {
        document.getElementById("newBarcode").focus()
      }, 100)
    })

    addToProcurementBtn.addEventListener("click", () => {
      this.addToProcurementBatch()
    })

    completeProcurementBtn.addEventListener("click", () => {
      this.completeProcurement()
    })

    clearProcurementBtn.addEventListener("click", () => {
      this.clearProcurementBatch()
    })

    const decreaseProcQty = document.getElementById("decreaseProcQty")
    const increaseProcQty = document.getElementById("increaseProcQty")
    const procQuantityInput = document.getElementById("procQuantity")

    if (decreaseProcQty) {
      decreaseProcQty.addEventListener("click", () => {
        const currentValue = Number.parseInt(procQuantityInput.value) || 1
        if (currentValue > 1) {
          procQuantityInput.value = currentValue - 1
          this.updateProcurementLineTotal()
        }
      })
    }

    if (increaseProcQty) {
      increaseProcQty.addEventListener("click", () => {
        const currentValue = Number.parseInt(procQuantityInput.value) || 1
        procQuantityInput.value = currentValue + 1
        this.updateProcurementLineTotal()
      })
    }
    ;["procQuantity", "procPurchasePrice"].forEach((id) => {
      document.getElementById(id).addEventListener("input", () => {
        this.updateProcurementLineTotal()
      })
    })
  }

  initInventoryEventListeners() {
    const inventorySearch = document.getElementById("inventorySearch")
    const inventoryFilter = document.getElementById("inventoryFilter")
    const printInventoryBtn = document.getElementById("printInventory")

    // Debounce inventory search for better performance
    const debouncedInventorySearch = debounce((searchValue, filterValue) => {
      this.loadInventory(searchValue, filterValue)
    }, 200)

    inventorySearch.addEventListener("input", (e) => {
      debouncedInventorySearch(e.target.value, inventoryFilter.value)
    })

    inventoryFilter.addEventListener("change", (e) => {
      debouncedInventorySearch(inventorySearch.value, e.target.value)
    })

    printInventoryBtn.addEventListener("click", () => {
      this.printInventory()
    })
  }

  initStatementsEventListeners() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tabId = btn.dataset.tab
        this.showTab(tabId)
      })
    })

    document.getElementById("generateSalesRange").addEventListener("click", () => {
      this.generateSalesRangeReport()
    })

    document.getElementById("generateProcurementRange").addEventListener("click", () => {
      this.generateProcurementRangeReport()
    })

    // FIX #2: Sync Statement date changes to Profit/Loss section
    const salesFromDate = document.getElementById("salesFromDate")
    const salesToDate = document.getElementById("salesToDate")

    if (salesFromDate) {
      salesFromDate.addEventListener("change", () => {
        const plStartDate = document.getElementById("plStartDate")
        if (plStartDate) {
          plStartDate.value = salesFromDate.value
        }
      })
    }

    if (salesToDate) {
      salesToDate.addEventListener("change", () => {
        const plEndDate = document.getElementById("plEndDate")
        if (plEndDate) {
          plEndDate.value = salesToDate.value
        }
      })
    }

    this.initPrintExportListeners()
  }

  initPrintExportListeners() {
    document.getElementById("printDailySales").addEventListener("click", () => {
      this.printStatement("daily-sales")
    })
    document.getElementById("printRangeSales").addEventListener("click", () => {
      this.printStatement("range-sales")
    })
    document.getElementById("printDailyProcurement").addEventListener("click", () => {
      this.printStatement("daily-procurement")
    })
    document.getElementById("printRangeProcurement").addEventListener("click", () => {
      this.printStatement("range-procurement")
    })

    document.getElementById("exportDailySales").addEventListener("click", () => {
      this.exportToCSV("daily-sales")
    })
    document.getElementById("exportRangeSales").addEventListener("click", () => {
      this.exportToCSV("range-sales")
    })
    document.getElementById("exportDailyProcurement").addEventListener("click", () => {
      this.exportToCSV("daily-procurement")
    })
    document.getElementById("exportRangeProcurement").addEventListener("click", () => {
      this.exportToCSV("range-procurement")
    })
  }

  initSettingsEventListeners() {
    document.getElementById("saveSettings").addEventListener("click", () => {
      this.saveSettings()
    })

    document.querySelector('[data-section="settings"]').addEventListener("click", () => {
      this.loadSettingsValues()
    })

    document.getElementById("resetData").addEventListener("click", () => {
      this.showResetConfirmModal()
    })
  }

  initModalEventListeners() {
    // Modal close handlers
    document.querySelectorAll(".close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", function () {
        this.closest(".modal").style.display = "none"
      })
    })

    const deleteConfirmModal = document.getElementById("deleteConfirmModal")
    const deleteConfirmText = document.getElementById("deleteConfirmText")
    const confirmDeleteBtn = document.getElementById("confirmDelete")
    const cancelDeleteBtn = document.getElementById("cancelDelete")
    const deleteConfirmError = document.getElementById("deleteConfirmError")

    deleteConfirmText.addEventListener("input", function () {
      const isValid = this.value === "CONFIRM"
      confirmDeleteBtn.disabled = !isValid
      if (isValid) {
        deleteConfirmError.style.display = "none"
      }
    })

    confirmDeleteBtn.addEventListener("click", () => {
      if (deleteConfirmText.value === "CONFIRM") {
        // Handle service delete or product delete
        if (shopManager.pendingDeleteServiceId) {
          shopManager.deleteService(shopManager.pendingDeleteServiceId)
          shopManager.pendingDeleteServiceId = null
        } else {
          shopManager.deleteProduct(shopManager.pendingDeleteBarcode)
        }
        deleteConfirmModal.style.display = "none"
      } else {
        deleteConfirmError.style.display = "block"
      }
    })

    cancelDeleteBtn.addEventListener("click", () => {
      deleteConfirmModal.style.display = "none"
    })

    window.addEventListener("click", (event) => {
      if (event.target === deleteConfirmModal) {
        deleteConfirmModal.style.display = "none"
      }
    })
    // </CHANGE>

    document.getElementById("saveNewProduct").addEventListener("click", () => {
      this.saveNewProduct()
    })

    document.getElementById("cancelNewProduct").addEventListener("click", () => {
      this.hideModal("newProductModal")
    })

    document.getElementById("decreaseNewQty").addEventListener("click", () => {
      const input = document.getElementById("newQuantity")
      const currentValue = Number.parseInt(input.value) || 0
      if (currentValue > 0) {
        input.value = currentValue - 1
      }
    })

    document.getElementById("increaseNewQty").addEventListener("click", () => {
      const input = document.getElementById("newQuantity")
      const currentValue = Number.parseInt(input.value) || 0
      input.value = currentValue + 1
    })

    const purchasePriceInput = document.getElementById("newPurchasePrice")
    const sellingPriceInput = document.getElementById("newSellingPrice")

    purchasePriceInput.addEventListener("input", () => {
      this.calculateNewProductProfit()
    })

    sellingPriceInput.addEventListener("input", () => {
      this.calculateNewProductProfit()
    })

    this.initReceiptListeners()

    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.hideModal(e.target.id)
      }
    })
  }

  showSection(sectionId) {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
    })
    document.querySelector(`[data-section="${sectionId}"]`).classList.add("active")

    document.querySelectorAll(".section").forEach((section) => {
      section.classList.remove("active")
    })
    document.getElementById(sectionId).classList.add("active")

    if (sectionId === "statements") {
      this.loadStatements()
    } else if (sectionId === "inventory") {
      this.loadInventory()
    } else if (sectionId === "settings") {
      this.loadSettingsValues()
    } else if (sectionId === "cost-management") {
      this.loadCostManagement()
    } else if (sectionId === "profit-loss") {
      this.generateProfitLossReport()
    } else if (sectionId === "customers") {
      this.showCustomerList()
    }
  }

  showTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-tab="${tabId}"]`).classList.add("active")

    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active")
    })
    document.getElementById(tabId).classList.add("active")
  }

  showModal(modalId) {
    document.getElementById(modalId).style.display = "block"
  }

  hideModal(modalId) {
    document.getElementById(modalId).style.display = "none"
  }

  updateDateTime() {
    const now = new Date()
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
    document.getElementById("currentDateTime").textContent = now.toLocaleString("en-US", options)
  }

  updateDashboard() {
    const today = new Date().toDateString()
    const todaySales = this.sales.filter((sale) => {
      const saleDate = sale.date ? new Date(sale.date).toDateString() : new Date(sale.timestamp).toDateString()
      return saleDate === today
    })

    let totalSales = 0
    let totalProfit = 0
    const totalTransactions = todaySales.length

    todaySales.forEach((sale) => {
      // Handle service sales
      if (sale.type === "service") {
        const saleAmount = sale.amount
        const profit = sale.profit || sale.amount
        totalSales += saleAmount
        totalProfit += profit
        return
      }

      // Handle regular product sales
      const saleDiscount = sale.discount || 0
      const saleGrossTotal = sale.items.reduce((sum, item) => sum + item.total, 0)
      const saleNetTotal = saleGrossTotal - saleDiscount

      sale.items.forEach((item) => {
        // Calculate profit based on discounted amounts
        const itemGrossTotal = item.total
        const itemDiscountPortion = (itemGrossTotal / saleGrossTotal) * saleDiscount
        const itemNetTotal = itemGrossTotal - itemDiscountPortion
        const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
        const profitAfterDiscount = profit - itemDiscountPortion

        totalSales += itemNetTotal
        totalProfit += profitAfterDiscount
      })
    })

    const lowStockProducts = this.products.filter(
      (p) => p.quantity <= this.settings.lowStockThreshold && p.quantity > 0,
    )

    document.getElementById("todaySales").textContent = this.formatCurrency(totalSales)
    document.getElementById("totalTransactions").textContent = totalTransactions
    document.getElementById("todayProfit").textContent = this.formatCurrency(totalProfit)
    document.getElementById("lowStockCount").textContent = lowStockProducts.length

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlySales = this.sales.filter((sale) => {
      const saleDate = sale.date ? new Date(sale.date) : new Date(sale.timestamp)
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
    })

    const monthlyProcurements = this.procurements.filter((proc) => {
      const procDate = new Date(proc.timestamp)
      return procDate.getMonth() === currentMonth && procDate.getFullYear() === currentYear
    })

    let monthlySalesTotal = 0
    let monthlyProfitTotal = 0
    const monthlyTransactionsCount = monthlySales.length

    monthlySales.forEach((sale) => {
      // Handle service sales
      if (sale.type === "service") {
        const saleAmount = sale.amount
        const profit = sale.profit || sale.amount
        monthlySalesTotal += saleAmount
        monthlyProfitTotal += profit
        return
      }

      // Handle regular product sales
      const saleDiscount = sale.discount || 0
      const saleGrossTotal = sale.items.reduce((sum, item) => sum + item.total, 0)
      const saleNetTotal = saleGrossTotal - saleDiscount

      sale.items.forEach((item) => {
        const itemGrossTotal = item.total
        const itemDiscountPortion = (itemGrossTotal / saleGrossTotal) * saleDiscount
        const itemNetTotal = itemGrossTotal - itemDiscountPortion
        const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
        const profitAfterDiscount = profit - itemDiscountPortion

        monthlySalesTotal += itemNetTotal
        monthlyProfitTotal += profitAfterDiscount
      })
    })

    let monthlyPurchasesTotal = 0
    monthlyProcurements.forEach((proc) => {
      proc.items.forEach((item) => {
        monthlyPurchasesTotal += item.total
      })
    })

    document.getElementById("monthlySales").textContent = this.formatCurrency(monthlySalesTotal)
    document.getElementById("monthlyProfit").textContent = this.formatCurrency(monthlyProfitTotal)
    document.getElementById("monthlyPurchases").textContent = this.formatCurrency(monthlyPurchasesTotal)
    document.getElementById("monthlyTransactions").textContent = monthlyTransactionsCount
  }

  formatCurrency(amount) {
    // Return only the number with Indian formatting, without currency symbol
    return formatIndianNumber(amount)
  }

  updateCurrencySymbols() {
    // Currency symbols are no longer displayed as per requirement
    // All .currency-symbol elements are kept empty or hidden
    document.querySelectorAll(".currency-symbol").forEach((el) => {
      el.textContent = ""
    })
  }

  handleEnhancedProductSearch(searchTerm, module) {
    const suggestionsContainer = document.getElementById(
      module === "sales" ? "productSuggestions" : "procurementSuggestions",
    )

    if (!searchTerm.trim()) {
      suggestionsContainer.style.display = "none"
      return
    }

    const activeMethod = document.querySelector(
      module === "sales" ? ".search-method.active" : '.search-method.active[data-module="procurement"]',
    )
    const searchMethod = activeMethod ? activeMethod.dataset.method : "name"

    let filteredProducts = []
    if (searchMethod === "barcode") {
      filteredProducts = this.products.filter((p) => p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    } else {
      filteredProducts = this.products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (filteredProducts.length === 0) {
      suggestionsContainer.innerHTML = '<div class="suggestion-item no-results">No products found</div>'
      suggestionsContainer.style.display = "block"
      return
    }

    suggestionsContainer.innerHTML = filteredProducts
      .map(
        (product) => `
      <div class="suggestion-item" data-barcode="${product.barcode}" data-module="${module}">
        <strong>${product.name}</strong> - ${product.company}<br>
        <small>Barcode: ${product.barcode} | Stock: ${product.quantity} | Price: ${this.formatCurrency(product.sellingPrice)}</small>
      </div>
    `,
      )
      .join("")

    suggestionsContainer.style.display = "block"
  }

  handleProductSearch(searchTerm, module) {
    this.handleEnhancedProductSearch(searchTerm, module)
  }

  selectProduct(barcode, module) {
    const product = this.products.find((p) => p.barcode === barcode)
    if (!product) return

    if (module === "sales") {
      document.getElementById("productSearch").value = product.name
      document.getElementById("productSuggestions").style.display = "none"
      document.getElementById("selectedProductName").textContent = product.name
      document.getElementById("selectedProductStock").textContent = product.quantity
      document.getElementById("selectedProductPrice").textContent = this.formatCurrency(product.sellingPrice)
      document.getElementById("saleQuantity").value = 1
      document.getElementById("saleQuantity").max = product.quantity
      document.getElementById("productDetails").style.display = "block"
      this.updateSaleLineTotal()
    } else if (module === "procurement") {
      document.getElementById("procurementSearch").value = product.name
      document.getElementById("procurementSuggestions").style.display = "none"
      document.getElementById("procQuantity").value = 1
      document.getElementById("procPurchasePrice").value = product.purchasePrice
      document.getElementById("procSellingPrice").value = product.sellingPrice
      this.updateProcurementLineTotal()
    }
  }

  updateSaleLineTotal() {
    const product = this.products.find((p) => p.name === document.getElementById("selectedProductName").textContent)
    if (!product) return

    const quantity = Number.parseInt(document.getElementById("saleQuantity").value) || 1
    const lineTotal = product.sellingPrice * quantity
    document.getElementById("lineTotal").textContent = this.formatCurrency(lineTotal)
  }

  updateProcurementLineTotal() {
    const quantity = Number.parseInt(document.getElementById("procQuantity").value) || 1
    const purchasePrice = Number.parseFloat(document.getElementById("procPurchasePrice").value) || 0
    const lineTotal = quantity * purchasePrice
    document.getElementById("procLineTotal").textContent = this.formatCurrency(lineTotal)
  }

  addToCurrentSale() {
    const productName = document.getElementById("selectedProductName").textContent
    const product = this.products.find((p) => p.name === productName)

    if (!product) {
      showToast("Please select a product first", "error")
      return
    }

    const quantity = Number.parseInt(document.getElementById("saleQuantity").value)

    if (quantity > product.quantity) {
      showToast("Insufficient stock available", "error")
      return
    }

    const existingItem = this.currentSale.find((item) => item.barcode === product.barcode)

    if (existingItem) {
      existingItem.quantity += quantity
      existingItem.total = existingItem.quantity * existingItem.sellingPrice
    } else {
      this.currentSale.push({
        barcode: product.barcode,
        name: product.name,
        quantity: quantity,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        total: quantity * product.sellingPrice,
      })
    }

    this.renderSaleItems()
    document.getElementById("productDetails").style.display = "none"
    document.getElementById("productSearch").value = ""
    showToast("Product added to sale", "success")
  }

  renderSaleItems() {
    const tbody = document.querySelector("#saleItemsTable tbody")
    tbody.innerHTML = ""

    let grandTotal = 0

    this.currentSale.forEach((item, index) => {
      grandTotal += item.total

      const row = tbody.insertRow()
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${this.formatCurrency(item.sellingPrice)}</td>
        <td>${this.formatCurrency(item.total)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="shopManager.removeFromSale(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `
    })

    const finalAmount = grandTotal - this.currentDiscount
    document.getElementById("saleGrandTotal").textContent = this.formatCurrency(finalAmount)
    this.updateChangeCalculation()
  }

  applyDiscount() {
    const discountInput = document.getElementById("discountAmount")
    const discountAmount = Number.parseFloat(discountInput.value) || 0

    if (this.currentSale.length === 0) {
      showToast("Please add items to the sale first", "error")
      return
    }

    const grandTotal = this.currentSale.reduce((sum, item) => sum + item.total, 0)

    if (discountAmount < 0) {
      showToast("Discount amount cannot be negative", "error")
      return
    }

    if (discountAmount > grandTotal) {
      showToast("Discount cannot exceed the total amount", "error")
      return
    }

    this.currentDiscount = discountAmount

    document.getElementById("appliedDiscount").textContent = this.formatCurrency(discountAmount)
    document.getElementById("discountDisplay").style.display = "block"

    this.renderSaleItems()
    this.updateChangeCalculation()
    showToast("Discount applied successfully", "success")
  }
  // </CHANGE>

  updateChangeCalculation() {
    const grandTotal = this.currentSale.reduce((sum, item) => sum + item.total, 0)
    const finalTotal = grandTotal - this.currentDiscount
    // </CHANGE>
    const receivedAmount = Number.parseFloat(document.getElementById("receivedAmount").value) || 0

    if (receivedAmount > 0) {
      const change = receivedAmount - finalTotal

      document.getElementById("changeTotal").textContent = this.formatCurrency(finalTotal)
      // </CHANGE>
      document.getElementById("changeReceived").textContent = this.formatCurrency(receivedAmount)
      document.getElementById("changeAmount").textContent = this.formatCurrency(change)
      document.getElementById("changeDisplay").style.display = "block"
    } else {
      document.getElementById("changeDisplay").style.display = "none"
    }
  }

  removeFromSale(index) {
    this.currentSale.splice(index, 1)
    this.renderSaleItems()
    if (this.currentSale.length === 0) {
      this.currentDiscount = 0
      document.getElementById("discountAmount").value = ""
      document.getElementById("discountDisplay").style.display = "none"
    }
    // </CHANGE>
  }

  completeSale() {
    if (this.currentSale.length === 0) {
      showToast("No items in current sale", "error")
      return
    }

    this.currentSale.forEach((item) => {
      const product = this.products.find((p) => p.barcode === item.barcode)
      if (product) {
        product.quantity -= item.quantity
      }
    })

    const sale = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      items: [...this.currentSale],
      total: this.currentSale.reduce((sum, item) => sum + item.total, 0),
      discount: this.currentDiscount,
      finalTotal: this.currentSale.reduce((sum, item) => sum + item.total, 0) - this.currentDiscount,
    }
    // </CHANGE>

    this.sales.push(sale)
    this.saveData()
    this.generateReceipt(sale)
    this.currentSale = []
    this.currentDiscount = 0
    // </CHANGE>
    this.renderSaleItems()
    this.updateDashboard()
    document.getElementById("receivedAmount").value = ""
    document.getElementById("changeDisplay").style.display = "none"
    document.getElementById("discountAmount").value = ""
    document.getElementById("discountDisplay").style.display = "none"
    // </CHANGE>
    showToast("Sale completed successfully!", "success")
  }

  clearCurrentSale() {
    this.currentSale = []
    this.currentDiscount = 0
    // </CHANGE>
    this.renderSaleItems()
    document.getElementById("receivedAmount").value = ""
    document.getElementById("changeDisplay").style.display = "none"
    document.getElementById("discountAmount").value = ""
    document.getElementById("discountDisplay").style.display = "none"
    // </CHANGE>
    showToast("Sale cleared", "info")
  }

  generateReceipt(sale) {
    const receiptContent = document.getElementById("receiptContent")

    let itemsHTML = ""
    sale.items.forEach((item) => {
      itemsHTML += `
        <div class="receipt-item">
          <span>${item.name} x${item.quantity}</span>
          <span>${this.formatCurrency(item.total)}</span>
        </div>
      `
    })

    let discountHTML = ""
    if (sale.discount > 0) {
      discountHTML = `
        <div class="receipt-item" style="color: var(--success); font-weight: 600;">
          <span>Discount:</span>
          <span>-${this.formatCurrency(sale.discount)}</span>
        </div>
      `
    }
    // </CHANGE>

    receiptContent.innerHTML = `
      <div class="receipt-header">
        <h2>${this.settings.shopName}</h2>
        <p>${this.settings.shopAddress}</p>
        <p>Phone: ${this.settings.shopPhone}</p>
        <p>Date: ${new Date(sale.timestamp).toLocaleString()}</p>
      </div>
      <div class="receipt-items">
        ${itemsHTML}
        ${discountHTML}
      </div>
      <div class="receipt-total">
        <strong>Total: ${this.formatCurrency(sale.finalTotal || sale.total)}</strong>
      </div>
      <div class="receipt-footer">
        <p>Thank you for your purchase!</p>
        <p>Please visit again</p>
      </div>
    `

    this.showModal("receiptModal")
  }

  addToProcurementBatch() {
    const productName = document.getElementById("procurementSearch").value
    const product = this.products.find((p) => p.name === productName)

    if (!product) {
      showToast("Please select a valid product", "error")
      return
    }

    const quantity = Number.parseInt(document.getElementById("procQuantity").value)
    const purchasePrice = Number.parseFloat(document.getElementById("procPurchasePrice").value)
    const sellingPrice = Number.parseFloat(document.getElementById("procSellingPrice").value)

    if (quantity <= 0 || purchasePrice <= 0 || sellingPrice <= 0) {
      showToast("Please enter valid values", "error")
      return
    }

    const existingItem = this.currentProcurement.find((item) => item.barcode === product.barcode)

    if (existingItem) {
      existingItem.quantity += quantity
      existingItem.total = existingItem.quantity * existingItem.purchasePrice
    } else {
      this.currentProcurement.push({
        barcode: product.barcode,
        name: product.name,
        quantity: quantity,
        purchasePrice: purchasePrice,
        sellingPrice: sellingPrice,
        total: quantity * purchasePrice,
      })
    }

    this.renderProcurementItems()
    document.getElementById("procurementSearch").value = ""
    document.getElementById("procQuantity").value = 1
    document.getElementById("procPurchasePrice").value = ""
    document.getElementById("procSellingPrice").value = ""
    document.getElementById("procLineTotal").textContent = this.formatCurrency(0)
    showToast("Product added to procurement batch", "success")
  }

  renderProcurementItems() {
    const tbody = document.querySelector("#procurementTable tbody")
    tbody.innerHTML = ""

    let batchTotal = 0

    this.currentProcurement.forEach((item, index) => {
      batchTotal += item.total

      const row = tbody.insertRow()
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${this.formatCurrency(item.purchasePrice)}</td>
        <td>${this.formatCurrency(item.sellingPrice)}</td>
        <td>${this.formatCurrency(item.total)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="shopManager.removeFromProcurement(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `
    })

    document.getElementById("procurementBatchTotal").textContent = this.formatCurrency(batchTotal)
  }

  removeFromProcurement(index) {
    this.currentProcurement.splice(index, 1)
    this.renderProcurementItems()
  }

  completeProcurement() {
    if (this.currentProcurement.length === 0) {
      showToast("No items in procurement batch", "error")
      return
    }

    this.currentProcurement.forEach((item) => {
      const product = this.products.find((p) => p.barcode === item.barcode)
      if (product) {
        product.quantity += item.quantity
        product.purchasePrice = item.purchasePrice
        product.sellingPrice = item.sellingPrice
      }
    })

    const procurement = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      items: [...this.currentProcurement],
      total: this.currentProcurement.reduce((sum, item) => sum + item.total, 0),
    }

    this.procurements.push(procurement)
    this.saveData()
    this.currentProcurement = []
    this.renderProcurementItems()
    this.updateDashboard()
    this.loadInventory()
    showToast("Procurement completed successfully!", "success")
  }

  clearProcurementBatch() {
    this.currentProcurement = []
    this.renderProcurementItems()
    showToast("Procurement batch cleared", "info")
  }

  saveNewProduct() {
    const barcode = document.getElementById("newBarcode").value.trim()
    const name = document.getElementById("newProductName").value.trim()
    const company = document.getElementById("newCompanyName").value.trim()
    const quantity = Number.parseInt(document.getElementById("newQuantity").value)
    const purchasePrice = Number.parseFloat(document.getElementById("newPurchasePrice").value)
    const sellingPrice = Number.parseFloat(document.getElementById("newSellingPrice").value)

    if (!barcode || !name || !company) {
      showToast("Please fill in all required fields", "error")
      return
    }

    if (this.products.find((p) => p.barcode === barcode)) {
      showToast("Product with this barcode already exists", "error")
      return
    }

    this.products.push({
      barcode,
      name,
      company,
      quantity,
      purchasePrice,
      sellingPrice,
    })

    if (quantity > 0) {
      const procurement = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        items: [
          {
            barcode,
            name,
            quantity,
            purchasePrice,
            sellingPrice,
            total: quantity * purchasePrice,
          },
        ],
        total: quantity * purchasePrice,
      }
      this.procurements.push(procurement)
    }
    // </CHANGE>

    this.saveData()
    this.loadInventory()
    this.hideModal("newProductModal")

    document.getElementById("newBarcode").value = ""
    document.getElementById("newProductName").value = ""
    document.getElementById("newCompanyName").value = ""
    document.getElementById("newQuantity").value = 0
    document.getElementById("newPurchasePrice").value = ""
    document.getElementById("newSellingPrice").value = ""

    showToast("New product added successfully!", "success")
  }

  calculateNewProductProfit() {
    const purchasePrice = Number.parseFloat(document.getElementById("newPurchasePrice").value) || 0
    const sellingPrice = Number.parseFloat(document.getElementById("newSellingPrice").value) || 0

    if (purchasePrice > 0 && sellingPrice > 0) {
      const profit = sellingPrice - purchasePrice
      const margin = ((profit / sellingPrice) * 100).toFixed(2)

      document.getElementById("expectedProfit").textContent = this.formatCurrency(profit)
      document.getElementById("profitMargin").textContent = `${margin}%`
      document.getElementById("profitPreview").style.display = "block"

      if (profit < 0) {
        document.getElementById("expectedProfit").classList.add("negative")
        document.getElementById("profitMargin").classList.add("negative")
      } else {
        document.getElementById("expectedProfit").classList.remove("negative")
        document.getElementById("profitMargin").classList.remove("negative")
      }
    } else {
      document.getElementById("profitPreview").style.display = "none"
    }
  }

  loadInventory(searchTerm = "", filterType = "all") {
    const tbody = document.querySelector("#inventoryTable tbody")
    tbody.innerHTML = ""

    let filteredProducts = this.products

    if (searchTerm) {
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.company.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType === "low-stock") {
      filteredProducts = filteredProducts.filter((p) => p.quantity <= this.settings.lowStockThreshold && p.quantity > 0)
    } else if (filterType === "out-of-stock") {
      filteredProducts = filteredProducts.filter((p) => p.quantity === 0)
    }

    filteredProducts.forEach((product) => {
      const row = tbody.insertRow()

      let statusClass = "status-in-stock"
      let statusText = "In Stock"

      if (product.quantity === 0) {
        statusClass = "status-out-of-stock"
        statusText = "Out of Stock"
      } else if (product.quantity <= this.settings.lowStockThreshold) {
        statusClass = "status-low-stock"
        statusText = "Low Stock"
      }

      row.innerHTML = `
        <td>${product.barcode}</td>
        <td>${product.name}</td>
        <td>${product.company}</td>
        <td>${product.quantity}</td>
        <td>${this.formatCurrency(product.purchasePrice)}</td>
        <td>${this.formatCurrency(product.sellingPrice)}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="shopManager.showDeleteConfirmation('${product.barcode}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `
    })

    if (filteredProducts.length === 0) {
      const row = tbody.insertRow()
      row.innerHTML = '<td colspan="8" style="text-align: center;">No products found</td>'
    }
  }

  showDeleteConfirmation(barcode) {
    this.pendingDeleteBarcode = barcode
    const modal = document.getElementById("deleteConfirmModal")
    const confirmInput = document.getElementById("deleteConfirmText")
    const confirmBtn = document.getElementById("confirmDelete")
    const errorMsg = document.getElementById("deleteConfirmError")

    // Reset modal state
    confirmInput.value = ""
    confirmBtn.disabled = true
    errorMsg.style.display = "none"

    modal.style.display = "block"
  }

  deleteProduct(barcode) {
    this.products = this.products.filter((p) => p.barcode !== barcode)
    this.saveData()
    this.loadInventory()
    showToast("Product deleted successfully", "success")
  }

  loadStatements() {
    this.loadDailySalesStatement()
    this.loadDailyProcurementStatement()
  }

  // In loadDailySalesStatement() - find this function and replace it completely
loadDailySalesStatement() {
  const today = new Date()
  document.getElementById("dailySalesDate").textContent = today.toLocaleDateString()

  const todaySales = this.sales.filter((sale) => {
    let saleDate
    if (sale.type === "service") {
      saleDate = new Date(sale.date).toDateString()
    } else {
      saleDate = new Date(sale.timestamp).toDateString()
    }
    return saleDate === today.toDateString()
  })

  const tbody = document.querySelector("#dailySalesTable tbody")
  tbody.innerHTML = ""

  let totalSales = 0
  let totalProfit = 0
  let totalDiscount = 0

  todaySales.forEach((sale, saleIndex) => {
    // Handle service sales
    if (sale.type === "service") {
      totalSales += sale.amount
      totalProfit += sale.profit

      const row = tbody.insertRow()
      row.innerHTML = `
        <td>${new Date(sale.date).toLocaleTimeString()}</td>
        <td>${sale.serviceName}</td>
        <td>${sale.quantity || 1}</td>
        <td>${this.formatCurrency(0)}</td>
        <td>${this.formatCurrency(sale.amount)}</td>
        <td>${this.formatCurrency(sale.profit)}</td>
        <td>${this.formatCurrency(sale.amount)}</td>
        <td>${this.formatCurrency(0)}</td>
        <td>-</td>
      `
      return
    }

    // Handle regular product sales
    const saleDiscount = sale.discount || 0
    totalDiscount += saleDiscount
    const saleGrossTotal = sale.items.reduce((sum, item) => sum + item.total, 0)

    sale.items.forEach((item, itemIndex) => {
      const itemGrossTotal = item.total
      const itemDiscountPortion = (itemGrossTotal / saleGrossTotal) * saleDiscount
      const itemNetTotal = itemGrossTotal - itemDiscountPortion
      const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
      const profitAfterDiscount = profit - itemDiscountPortion

      totalSales += itemNetTotal
      totalProfit += profitAfterDiscount

      const row = tbody.insertRow()
      row.innerHTML = `
        <td>${new Date(sale.timestamp).toLocaleTimeString()}</td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${this.formatCurrency(item.purchasePrice)}</td>
        <td>${this.formatCurrency(item.sellingPrice)}</td>
        <td>${this.formatCurrency(profitAfterDiscount)}</td>
        <td>${this.formatCurrency(itemNetTotal)}</td>
        <td>${this.formatCurrency(itemDiscountPortion)}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="shopManager.showAdjustSaleModal(${saleIndex}, ${itemIndex})">
            <i class="fas fa-edit"></i> Adjust
          </button>
        </td>
      `
    })
  })

  if (todaySales.length === 0) {
    const row = tbody.insertRow()
    row.innerHTML = '<td colspan="9" style="text-align: center;">No sales data for today</td>'
  }

  document.getElementById("dailySalesTotal").textContent = this.formatCurrency(totalSales)
  document.getElementById("dailyProfitTotal").textContent = this.formatCurrency(totalProfit)
  document.getElementById("dailyDiscountTotal").textContent = this.formatCurrency(totalDiscount)
}

// In generateSalesRangeReport() - find and replace completely
generateSalesRangeReport() {
  const fromDate = new Date(document.getElementById("salesFromDate").value)
  const toDate = new Date(document.getElementById("salesToDate").value)

  if (!fromDate || !toDate) {
    showToast("Please select both dates", "error")
    return
  }

  fromDate.setHours(0, 0, 0, 0)
  toDate.setHours(23, 59, 59, 999)

  const rangeSales = this.sales.filter((sale) => {
    let saleDate
    if (sale.type === "service") {
      saleDate = new Date(sale.date)
    } else {
      saleDate = new Date(sale.timestamp)
    }
    return saleDate >= fromDate && saleDate <= toDate
  })

  const tbody = document.querySelector("#rangeSalesTable tbody")
  tbody.innerHTML = ""

  let totalSales = 0
  let totalProfit = 0
  let totalDiscount = 0

  rangeSales.forEach((sale) => {
    // Handle service sales
    if (sale.type === "service") {
      totalSales += sale.amount
      totalProfit += sale.profit

      const row = tbody.insertRow()
      row.innerHTML = `
        <td>${new Date(sale.date).toLocaleDateString()}</td>
        <td>${new Date(sale.date).toLocaleTimeString()}</td>
        <td>${sale.serviceName}</td>
        <td>1</td>
        <td>${this.formatCurrency(0)}</td>
        <td>${this.formatCurrency(sale.amount)}</td>
        <td>${this.formatCurrency(sale.profit)}</td>
        <td>${this.formatCurrency(sale.amount)}</td>
        <td>${this.formatCurrency(0)}</td>
      `
      return
    }

    // Handle regular product sales
    const saleDiscount = sale.discount || 0
    totalDiscount += saleDiscount
    const saleGrossTotal = sale.items.reduce((sum, item) => sum + item.total, 0)

    sale.items.forEach((item) => {
      const itemGrossTotal = item.total
      const itemDiscountPortion = (itemGrossTotal / saleGrossTotal) * saleDiscount
      const itemNetTotal = itemGrossTotal - itemDiscountPortion
      const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
      const profitAfterDiscount = profit - itemDiscountPortion

      totalSales += itemNetTotal
      totalProfit += profitAfterDiscount

      const row = tbody.insertRow()
      row.innerHTML = `
        <td>${new Date(sale.timestamp).toLocaleDateString()}</td>
        <td>${new Date(sale.timestamp).toLocaleTimeString()}</td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${this.formatCurrency(item.purchasePrice)}</td>
        <td>${this.formatCurrency(item.sellingPrice)}</td>
        <td>${this.formatCurrency(profitAfterDiscount)}</td>
        <td>${this.formatCurrency(itemNetTotal)}</td>
        <td>${this.formatCurrency(itemDiscountPortion)}</td>
      `
    })
  })

  if (rangeSales.length === 0) {
    const row = tbody.insertRow()
    row.innerHTML = '<td colspan="9" style="text-align: center;">No sales data for selected range</td>'
  }

  document.getElementById("rangeSalesTotal").textContent = this.formatCurrency(totalSales)
  document.getElementById("rangeProfitTotal").textContent = this.formatCurrency(totalProfit)
  document.getElementById("rangeDiscountTotal").textContent = this.formatCurrency(totalDiscount)

  showToast("Sales range report generated", "success")
}

// Fix prepareDailySalesPrintContent()
prepareDailySalesPrintContent() {
  const today = new Date().toDateString()
  const dailySales = this.sales.filter((sale) => {
    let saleDate
    if (sale.type === "service") {
      saleDate = new Date(sale.date).toDateString()
    } else {
      saleDate = new Date(sale.timestamp).toDateString()
    }
    return saleDate === today
  })

  let totalSales = 0
  let totalProfit = 0
  let totalDiscount = 0

  const rows = dailySales.map((sale) => {
    if (sale.type === "service") {
      totalSales += sale.amount
      totalProfit += sale.profit

      return `
        <tr>
          <td>${new Date(sale.date).toLocaleTimeString()}</td>
          <td>${sale.serviceName}</td>
          <td>1</td>
          <td>${this.formatCurrency(0)}</td>
          <td>${this.formatCurrency(sale.amount)}</td>
          <td>${this.formatCurrency(sale.profit)}</td>
          <td>${this.formatCurrency(sale.amount)}</td>
          <td>${this.formatCurrency(0)}</td>
        </tr>
      `
    }

    const saleDiscount = sale.discount || 0
    totalDiscount += saleDiscount
    const saleGrossTotal = sale.items.reduce((sum, item) => sum + item.total, 0)

    return sale.items.map((item) => {
      const itemGrossTotal = item.total
      const itemDiscountPortion = (itemGrossTotal / saleGrossTotal) * saleDiscount
      const itemNetTotal = itemGrossTotal - itemDiscountPortion
      const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
      const profitAfterDiscount = profit - itemDiscountPortion

      totalSales += itemNetTotal
      totalProfit += profitAfterDiscount

      return `
        <tr>
          <td>${new Date(sale.timestamp).toLocaleTimeString()}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${this.formatCurrency(item.purchasePrice)}</td>
          <td>${this.formatCurrency(item.sellingPrice)}</td>
          <td>${this.formatCurrency(profitAfterDiscount)}</td>
          <td>${this.formatCurrency(itemNetTotal)}</td>
          <td>${this.formatCurrency(itemDiscountPortion)}</td>
        </tr>
      `
    }).join('')
  }).join('')

  return `
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Product</th>
          <th>Quantity</th>
          <th>Purchase Price</th>
          <th>Selling Price</th>
          <th>Profit</th>
          <th>Line Total</th>
          <th>Discount</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="8" style="text-align: center;">No sales data available</td></tr>'}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-row">
        <span>Total Sales Amount:</span>
        <span>${this.formatCurrency(totalSales)}</span>
      </div>
      <div class="total-row">
        <span>Total Profit:</span>
        <span>${this.formatCurrency(totalProfit)}</span>
      </div>
      <div class="total-row">
        <span>Total Discount:</span>
        <span>${this.formatCurrency(totalDiscount)}</span>
      </div>
    </div>
  `
}

// Fix prepareRangeSalesPrintContent()
prepareRangeSalesPrintContent() {
  const fromDate = new Date(document.getElementById("salesFromDate").value)
  const toDate = new Date(document.getElementById("salesToDate").value)

  if (!fromDate || !toDate) {
    showToast("Please select a valid date range first", "error")
    return ""
  }

  fromDate.setHours(0, 0, 0, 0)
  toDate.setHours(23, 59, 59, 999)

  const rangeSales = this.sales.filter((sale) => {
    let saleDate
    if (sale.type === "service") {
      saleDate = new Date(sale.date)
    } else {
      saleDate = new Date(sale.timestamp)
    }
    return saleDate >= fromDate && saleDate <= toDate
  })

  let totalSales = 0
  let totalProfit = 0
  let totalDiscount = 0

  const rows = rangeSales.map((sale) => {
    if (sale.type === "service") {
      totalSales += sale.amount
      totalProfit += sale.profit

      return `
        <tr>
          <td>${new Date(sale.date).toLocaleDateString()}</td>
          <td>${new Date(sale.date).toLocaleTimeString()}</td>
          <td>${sale.serviceName}</td>
          <td>1</td>
          <td>${this.formatCurrency(0)}</td>
          <td>${this.formatCurrency(sale.amount)}</td>
          <td>${this.formatCurrency(sale.profit)}</td>
          <td>${this.formatCurrency(sale.amount)}</td>
          <td>${this.formatCurrency(0)}</td>
        </tr>
      `
    }

    const saleDiscount = sale.discount || 0
    totalDiscount += saleDiscount
    const saleGrossTotal = sale.items.reduce((sum, item) => sum + item.total, 0)

    return sale.items.map((item) => {
      const itemGrossTotal = item.total
      const itemDiscountPortion = (itemGrossTotal / saleGrossTotal) * saleDiscount
      const itemNetTotal = itemGrossTotal - itemDiscountPortion
      const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
      const profitAfterDiscount = profit - itemDiscountPortion

      totalSales += itemNetTotal
      totalProfit += profitAfterDiscount

      return `
        <tr>
          <td>${new Date(sale.timestamp).toLocaleDateString()}</td>
          <td>${new Date(sale.timestamp).toLocaleTimeString()}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${this.formatCurrency(item.purchasePrice)}</td>
          <td>${this.formatCurrency(item.sellingPrice)}</td>
          <td>${this.formatCurrency(profitAfterDiscount)}</td>
          <td>${this.formatCurrency(itemNetTotal)}</td>
          <td>${this.formatCurrency(itemDiscountPortion)}</td>
        </tr>
      `
    }).join('')
  }).join('')

  return `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Product</th>
          <th>Quantity</th>
          <th>Purchase Price</th>
          <th>Selling Price</th>
          <th>Profit</th>
          <th>Line Total</th>
          <th>Discount</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="9" style="text-align: center;">No sales data for selected range</td></tr>'}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-row">
        <span>Total Sales Amount:</span>
        <span>${this.formatCurrency(totalSales)}</span>
      </div>
      <div class="total-row">
        <span>Total Profit:</span>
        <span>${this.formatCurrency(totalProfit)}</span>
      </div>
      <div class="total-row">
        <span>Total Discount:</span>
        <span>${this.formatCurrency(totalDiscount)}</span>
      </div>
    </div>
  `
}
  // </CHANGE>

  showAdjustSaleModal(saleIndex, itemIndex) {
    const sale = this.sales[saleIndex]
    const item = sale.items[itemIndex]

    const modal = document.getElementById("adjustSaleModal")
    if (!modal) {
      this.createAdjustSaleModal()
    }

    const adjustModal = document.getElementById("adjustSaleModal")
    document.getElementById("adjustSaleProductName").textContent = item.name
    document.getElementById("adjustSaleCurrentQty").textContent = item.quantity
    document.getElementById("adjustSaleQuantityInput").value = ""
    document.getElementById("adjustSaleQuantityInput").focus()

    // Store references for confirmation
    adjustModal.dataset.saleIndex = saleIndex
    adjustModal.dataset.itemIndex = itemIndex

    adjustModal.style.display = "block"
  }

  createAdjustSaleModal() {
    const modal = document.createElement("div")
    modal.id = "adjustSaleModal"
    modal.className = "modal"
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Adjust Sale Quantity</h3>
          <span class="close" onclick="document.getElementById('adjustSaleModal').style.display='none'">&times;</span>
        </div>
        <div class="modal-body">
          <div class="custom-quantity-info">
            <p><strong>Product:</strong> <span id="adjustSaleProductName"></span></p>
            <p><strong>Current Quantity:</strong> <span id="adjustSaleCurrentQty"></span></p>
          </div>
          <div class="form-group">
            <label for="adjustSaleQuantityInput" class="quantity-label">Quantity to Remove:</label>
            <input type="number" id="adjustSaleQuantityInput" class="quantity-input-large" min="1" placeholder="">
            <span class="help-text">Enter the number of items to deduct from this sale. The inventory will be automatically restocked.</span>
          </div>
        </div>
        <div class="modal-footer">
          <button id="confirmAdjustSale" class="btn btn-primary" onclick="shopManager.confirmAdjustSale()">
            <i class="fas fa-check"></i> Confirm Adjustment
          </button>
          <button class="btn btn-secondary" onclick="document.getElementById('adjustSaleModal').style.display='none'">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </div>
    `
    document.body.appendChild(modal)
  }

  confirmAdjustSale() {
    const modal = document.getElementById("adjustSaleModal")
    const saleIndex = Number.parseInt(modal.dataset.saleIndex)
    const itemIndex = Number.parseInt(modal.dataset.itemIndex)
    const quantityToRemove = Number.parseInt(document.getElementById("adjustSaleQuantityInput").value) || 0

    if (quantityToRemove <= 0) {
      showToast("Please enter a valid quantity", "error")
      return
    }

    const sale = this.sales[saleIndex]
    const item = sale.items[itemIndex]

    if (quantityToRemove > item.quantity) {
      showToast(`Cannot remove more than ${item.quantity} items`, "error")
      return
    }

    // Find the product and restock it
    const product = this.products.find((p) => p.barcode === item.barcode)
    if (product) {
      product.quantity += quantityToRemove
    }

    // Calculate the amount to deduct from the sale
    const amountPerItem = item.total / item.quantity
    const amountToDeduct = amountPerItem * quantityToRemove

    // Update the item quantity and total
    item.quantity -= quantityToRemove
    item.total -= amountToDeduct

    // If quantity becomes 0, remove the item from the sale
    if (item.quantity === 0) {
      sale.items.splice(itemIndex, 1)
    }

    // Update sale totals
    sale.total = sale.items.reduce((sum, i) => sum + i.total, 0)
    sale.finalTotal = sale.total - (sale.discount || 0)

    // If no items left in sale, remove the entire sale
    if (sale.items.length === 0) {
      this.sales.splice(saleIndex, 1)
    }

    // Save and refresh
    this.saveData()
    this.loadDailySalesStatement()
    this.updateDashboard()
    this.loadInventory()

    modal.style.display = "none"
    showToast(`${quantityToRemove} item(s) removed and inventory restocked`, "success")
  }
  // </CHANGE>

  loadDailyProcurementStatement() {
    const today = new Date()
    document.getElementById("dailyProcurementDate").textContent = today.toLocaleDateString()

    const todayProcurements = this.procurements.filter(
      (proc) => new Date(proc.timestamp).toDateString() === today.toDateString(),
    )

    const tbody = document.querySelector("#dailyProcurementTable tbody")
    tbody.innerHTML = ""

    let totalPurchases = 0

    todayProcurements.forEach((proc) => {
      proc.items.forEach((item) => {
        totalPurchases += item.total

        const row = tbody.insertRow()
        row.innerHTML = `
          <td>${new Date(proc.timestamp).toLocaleTimeString()}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${this.formatCurrency(item.purchasePrice)}</td>
          <td>${this.formatCurrency(item.sellingPrice)}</td>
          <td>${this.formatCurrency(item.total)}</td>
        `
      })
    })

    if (todayProcurements.length === 0) {
      const row = tbody.insertRow()
      row.innerHTML = '<td colspan="6" style="text-align: center;">No procurement data for today</td>'
    }

    document.getElementById("dailyProcurementTotal").textContent = this.formatCurrency(totalPurchases)
  }

  generateSalesRangeReport() {
  const fromDate = new Date(document.getElementById("salesFromDate").value)
  const toDate = new Date(document.getElementById("salesToDate").value)

  if (!fromDate || !toDate) {
    showToast("Please select both dates", "error")
    return
  }

  fromDate.setHours(0, 0, 0, 0)
  toDate.setHours(23, 59, 59, 999)

  const rangeSales = this.sales.filter((sale) => {
    const saleDate = sale.date ? new Date(sale.date) : new Date(sale.timestamp)
    return saleDate >= fromDate && saleDate <= toDate
  })

  const tbody = document.querySelector("#rangeSalesTable tbody")
  tbody.innerHTML = ""

  let totalSales = 0
  let totalProfit = 0
  let totalDiscount = 0

  rangeSales.forEach((sale) => {
    // ============ HANDLE SERVICE SALES ============
    if (sale.type === "service") {
      const saleAmount = sale.amount || 0
      const profit = sale.profit || saleAmount
      
      totalSales += saleAmount
      totalProfit += profit

      const row = tbody.insertRow()
      row.innerHTML = `
        <td>${new Date(sale.date).toLocaleDateString()}</td>
        <td>${new Date(sale.date).toLocaleTimeString()}</td>
        <td><strong>[SERVICE]</strong> ${sale.serviceName} (${sale.customerName})</td>
        <td>${sale.quantity} ${sale.serviceUnit}</td>
        <td>${this.formatCurrency(0)}</td>
        <td>${this.formatCurrency(saleAmount)}</td>
        <td>${this.formatCurrency(profit)}</td>
        <td>${this.formatCurrency(saleAmount)}</td>
        <td>${this.formatCurrency(0)}</td>
      `
      return
    }

    // ============ HANDLE PRODUCT SALES ============
    if (!sale.items || sale.items.length === 0) return

    const saleDiscount = sale.discount || 0
    totalDiscount += saleDiscount
    const saleGrossTotal = sale.items.reduce((sum, item) => sum + item.total, 0)

    sale.items.forEach((item) => {
      const itemGrossTotal = item.total
      const itemDiscountPortion = saleGrossTotal > 0 ? (itemGrossTotal / saleGrossTotal) * saleDiscount : 0
      const itemNetTotal = itemGrossTotal - itemDiscountPortion
      const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
      const profitAfterDiscount = profit - itemDiscountPortion

      totalSales += itemNetTotal
      totalProfit += profitAfterDiscount

      const row = tbody.insertRow()
      row.innerHTML = `
        <td>${new Date(sale.timestamp).toLocaleDateString()}</td>
        <td>${new Date(sale.timestamp).toLocaleTimeString()}</td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${this.formatCurrency(item.purchasePrice)}</td>
        <td>${this.formatCurrency(item.sellingPrice)}</td>
        <td>${this.formatCurrency(profitAfterDiscount)}</td>
        <td>${this.formatCurrency(itemNetTotal)}</td>
        <td>${this.formatCurrency(itemDiscountPortion)}</td>
      `
    })
  })

  if (rangeSales.length === 0) {
    const row = tbody.insertRow()
    row.innerHTML = '<td colspan="9" style="text-align: center;">No sales data for selected range</td>'
  }

  document.getElementById("rangeSalesTotal").textContent = this.formatCurrency(totalSales)
  document.getElementById("rangeProfitTotal").textContent = this.formatCurrency(totalProfit)
  document.getElementById("rangeDiscountTotal").textContent = this.formatCurrency(totalDiscount)

  showToast("Sales range report generated", "success")
  }

  generateProcurementRangeReport() {
    const fromDate = new Date(document.getElementById("procurementFromDate").value)
    const toDate = new Date(document.getElementById("procurementToDate").value)

    if (!fromDate || !toDate) {
      showToast("Please select both dates", "error")
      return
    }

    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    const rangeProcurements = this.procurements.filter((proc) => {
      const procDate = new Date(proc.timestamp)
      return procDate >= fromDate && procDate <= toDate
    })

    const tbody = document.querySelector("#rangeProcurementTable tbody")
    tbody.innerHTML = ""

    let totalPurchases = 0

    rangeProcurements.forEach((proc) => {
      proc.items.forEach((item) => {
        totalPurchases += item.total

        const row = tbody.insertRow()
        row.innerHTML = `
          <td>${new Date(proc.timestamp).toLocaleDateString()}</td>
          <td>${new Date(proc.timestamp).toLocaleTimeString()}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${this.formatCurrency(item.purchasePrice)}</td>
          <td>${this.formatCurrency(item.sellingPrice)}</td>
          <td>${this.formatCurrency(item.total)}</td>
        `
      })
    })

    if (rangeProcurements.length === 0) {
      const row = tbody.insertRow()
      row.innerHTML = '<td colspan="7" style="text-align: center;">No procurement data for selected range</td>'
    }

    document.getElementById("rangeProcurementTotal").textContent = this.formatCurrency(totalPurchases)

    showToast("Procurement range report generated", "success")
  }

  printStatement(statementType) {
    let printContent = ""
    let title = ""

    switch (statementType) {
      case "daily-sales":
        title = `Daily Sales Statement - ${new Date().toLocaleDateString()}`
        printContent = this.prepareDailySalesPrintContent()
        break
      case "range-sales":
        const fromDate = document.getElementById("salesFromDate").value
        const toDate = document.getElementById("salesToDate").value
        title = `Sales Statement - ${fromDate} to ${toDate}`
        printContent = this.prepareRangeSalesPrintContent()
        break
      case "daily-procurement":
        title = `Daily Procurement Statement - ${new Date().toLocaleDateString()}`
        printContent = this.prepareDailyProcurementPrintContent()
        break
      case "range-procurement":
        const procFromDate = document.getElementById("procurementFromDate").value
        const procToDate = document.getElementById("procurementToDate").value
        title = `Procurement Statement - ${procFromDate} to ${procToDate}`
        printContent = this.prepareRangeProcurementPrintContent()
        break
      default:
        showToast("Unknown statement type", "error")
        return
    }

    const printWindow = window.open("", "_blank", "width=800,height=600")

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #000;
              background: #fff;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .header h1 { 
              margin: 0 0 10px 0; 
              font-size: 24px;
            }
            .header p { 
              margin: 5px 0; 
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f0f0f0; 
              font-weight: bold;
            }
            .totals { 
              margin-top: 20px; 
              font-weight: bold; 
              font-size: 14px;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 5px; 
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${this.settings.shopName}</h1>
            <p>${this.settings.shopAddress}</p>
            <p>Phone: ${this.settings.shopPhone}</p>
            <p><strong>${title}</strong></p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          ${printContent}
          <div class="footer">
            <p>This is a computer-generated report from ${this.settings.shopName}</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      setTimeout(() => {
        printWindow.close()
      }, 3000)
    }
  }

  prepareDailySalesPrintContent() {
    const today = new Date().toDateString()
    const dailySales = this.sales.filter((sale) => {
      const saleDate = sale.date ? new Date(sale.date).toDateString() : new Date(sale.timestamp).toDateString()
      return saleDate === today
    })

    let totalSales = 0
    let totalProfit = 0
    let totalDiscount = 0

    const rows = dailySales
      .flatMap((sale) => {
        // Handle service sales - treat as normal sales
        if (sale.type === "service") {
          const saleAmount = sale.amount
          const profit = sale.profit || sale.amount
          totalSales += saleAmount
          totalProfit += profit

          return `
          <tr>
            <td>${new Date(sale.date).toLocaleTimeString()}</td>
            <td>${sale.serviceName} (${sale.customerName})</td>
            <td>1</td>
            <td>${this.formatCurrency(0)}</td>
            <td>${this.formatCurrency(saleAmount)}</td>
            <td>${this.formatCurrency(profit)}</td>
            <td>${this.formatCurrency(saleAmount)}</td>
            <td>${this.formatCurrency(0)}</td>
          </tr>
        `
        }

        // Handle regular product sales
        const saleDiscount = sale.discount || 0
        totalDiscount += saleDiscount
        const saleGrossTotal = sale.items ? sale.items.reduce((sum, item) => sum + item.total, 0) : 0

        if (!sale.items || sale.items.length === 0) return ""

        return sale.items.map((item) => {
          const itemGrossTotal = item.total
          const itemDiscountPortion = saleGrossTotal > 0 ? (itemGrossTotal / saleGrossTotal) * saleDiscount : 0
          const itemNetTotal = itemGrossTotal - itemDiscountPortion
          const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
          const profitAfterDiscount = profit - itemDiscountPortion

          totalSales += itemNetTotal
          totalProfit += profitAfterDiscount

          return `
          <tr>
            <td>${new Date(sale.timestamp).toLocaleTimeString()}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${this.formatCurrency(item.purchasePrice)}</td>
            <td>${this.formatCurrency(item.sellingPrice)}</td>
            <td>${this.formatCurrency(profitAfterDiscount)}</td>
            <td>${this.formatCurrency(itemNetTotal)}</td>
            <td>${this.formatCurrency(itemDiscountPortion)}</td>
          </tr>
        `
        })
      })
      .join("")

    return `
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Selling Price</th>
            <th>Profit</th>
            <th>Line Total</th>
            <th>Discount</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="8" style="text-align: center;">No sales data available</td></tr>'}
        </tbody>
      </table>
      <div class="totals">
        <div class="total-row">
          <span>Total Sales Amount:</span>
          <span>${this.formatCurrency(totalSales)}</span>
        </div>
        <div class="total-row">
          <span>Total Profit:</span>
          <span>${this.formatCurrency(totalProfit)}</span>
        </div>
        <div class="total-row">
          <span>Total Discount:</span>
          <span>${this.formatCurrency(totalDiscount)}</span>
        </div>
      </div>
    `
  }

  prepareRangeSalesPrintContent() {
    const fromDate = new Date(document.getElementById("salesFromDate").value)
    const toDate = new Date(document.getElementById("salesToDate").value)

    if (!fromDate || !toDate) {
      showToast("Please select a valid date range first", "error")
      return ""
    }

    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    const rangeSales = this.sales.filter((sale) => {
      const saleDate = sale.date ? new Date(sale.date) : new Date(sale.timestamp)
      return saleDate >= fromDate && saleDate <= toDate
    })

    let totalSales = 0
    let totalProfit = 0
    let totalDiscount = 0

    const rows = rangeSales
      .flatMap((sale) => {
        // Handle service sales - treat as normal sales
        if (sale.type === "service") {
          const saleAmount = sale.amount
          const profit = sale.profit || sale.amount
          totalSales += saleAmount
          totalProfit += profit

          return `
          <tr>
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${new Date(sale.date).toLocaleTimeString()}</td>
            <td>${sale.serviceName} (${sale.customerName})</td>
            <td>1</td>
            <td>${this.formatCurrency(0)}</td>
            <td>${this.formatCurrency(saleAmount)}</td>
            <td>${this.formatCurrency(profit)}</td>
            <td>${this.formatCurrency(saleAmount)}</td>
            <td>${this.formatCurrency(0)}</td>
          </tr>
        `
        }

        // Handle regular product sales
        const saleDiscount = sale.discount || 0
        totalDiscount += saleDiscount
        const saleGrossTotal = sale.items ? sale.items.reduce((sum, item) => sum + item.total, 0) : 0

        if (!sale.items || sale.items.length === 0) return ""

        return sale.items.map((item) => {
          const itemGrossTotal = item.total
          const itemDiscountPortion = saleGrossTotal > 0 ? (itemGrossTotal / saleGrossTotal) * saleDiscount : 0
          const itemNetTotal = itemGrossTotal - itemDiscountPortion
          const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
          const profitAfterDiscount = profit - itemDiscountPortion

          totalSales += itemNetTotal
          totalProfit += profitAfterDiscount

          return `
          <tr>
            <td>${new Date(sale.timestamp).toLocaleDateString()}</td>
            <td>${new Date(sale.timestamp).toLocaleTimeString()}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${this.formatCurrency(item.purchasePrice)}</td>
            <td>${this.formatCurrency(item.sellingPrice)}</td>
            <td>${this.formatCurrency(profitAfterDiscount)}</td>
            <td>${this.formatCurrency(itemNetTotal)}</td>
            <td>${this.formatCurrency(itemDiscountPortion)}</td>
          </tr>
        `
        })
      })
      .join("")

    return `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Selling Price</th>
            <th>Profit</th>
            <th>Line Total</th>
            <th>Discount</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="9" style="text-align: center;">No sales data available for selected range</td></tr>'}
        </tbody>
      </table>
      <div class="totals">
        <div class="total-row">
          <span>Total Sales Amount:</span>
          <span>${this.formatCurrency(totalSales)}</span>
        </div>
        <div class="total-row">
          <span>Total Profit:</span>
          <span>${this.formatCurrency(totalProfit)}</span>
        </div>
        <div class="total-row">
          <span>Total Discount:</span>
          <span>${this.formatCurrency(totalDiscount)}</span>
        </div>
      </div>
    `
  }

  prepareDailyProcurementPrintContent() {
    const today = new Date().toDateString()
    const dailyProcurements = this.procurements.filter((proc) => new Date(proc.timestamp).toDateString() === today)

    let totalPurchases = 0

    const rows = dailyProcurements
      .flatMap((proc) =>
        proc.items.map((item) => {
          totalPurchases += item.total

          return `
          <tr>
            <td>${new Date(proc.timestamp).toLocaleTimeString()}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${this.formatCurrency(item.purchasePrice)}</td>
            <td>${this.formatCurrency(item.sellingPrice)}</td>
            <td>${this.formatCurrency(item.total)}</td>
          </tr>
        `
        }),
      )
      .join("")

    return `
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Selling Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="6" style="text-align: center;">No procurement data available</td></tr>'}
        </tbody>
      </table>
      <div class="totals">
        <div class="total-row">
          <span>Total Purchase Amount:</span>
          <span>${this.formatCurrency(totalPurchases)}</span>
        </div>
      </div>
    `
  }

  prepareRangeProcurementPrintContent() {
    const fromDate = new Date(document.getElementById("procurementFromDate").value)
    const toDate = new Date(document.getElementById("procurementToDate").value)

    if (!fromDate || !toDate) {
      return "<p>Please select a valid date range first.</p>"
    }

    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    const rangeProcurements = this.procurements.filter((proc) => {
      const procDate = new Date(proc.timestamp)
      return procDate >= fromDate && procDate <= toDate
    })

    let totalPurchases = 0

    const rows = rangeProcurements
      .flatMap((proc) =>
        proc.items.map((item) => {
          totalPurchases += item.total

          return `
          <tr>
            <td>${new Date(proc.timestamp).toLocaleDateString()}</td>
            <td>${new Date(proc.timestamp).toLocaleTimeString()}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${this.formatCurrency(item.purchasePrice)}</td>
            <td>${this.formatCurrency(item.sellingPrice)}</td>
            <td>${this.formatCurrency(item.total)}</td>
          </tr>
        `
        }),
      )
      .join("")

    return `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Selling Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="7" style="text-align: center;">No procurement data for selected range</td></tr>'}
        </tbody>
      </table>
      <div class="totals">
        <div class="total-row">
          <span>Total Purchase Amount:</span>
          <span>${this.formatCurrency(totalPurchases)}</span>
        </div>
      </div>
    `
  }

  exportToCSV(statementType) {
    let csvContent = ""
    let filename = ""

    switch (statementType) {
      case "daily-sales":
        csvContent = this.prepareDailySalesCSV()
        filename = `daily-sales-${new Date().toISOString().split("T")[0]}.csv`
        break
      case "range-sales":
        csvContent = this.prepareRangeSalesCSV()
        filename = `sales-range-${new Date().toISOString().split("T")[0]}.csv`
        break
      case "daily-procurement":
        csvContent = this.prepareDailyProcurementCSV()
        filename = `daily-procurement-${new Date().toISOString().split("T")[0]}.csv`
        break
      case "range-procurement":
        csvContent = this.prepareRangeProcurementCSV()
        filename = `procurement-range-${new Date().toISOString().split("T")[0]}.csv`
        break
      default:
        showToast("Unknown statement type", "error")
        return
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast("CSV exported successfully!", "success")
  }

  prepareDailySalesCSV() {
  const today = new Date().toDateString()
  const dailySales = this.sales.filter((sale) => {
    const saleDate = sale.date ? new Date(sale.date).toDateString() : new Date(sale.timestamp).toDateString()
    return saleDate === today
  })

  let csv = "Time,Product,Quantity,Purchase Price,Selling Price,Profit,Line Total,Discount\n"

  dailySales.forEach((sale) => {
      const saleDiscount = sale.discount || 0
      const saleGrossTotal = sale.items.reduce((sum, item) => sum + item.total, 0)

      sale.items.forEach((item) => {
        const itemGrossTotal = item.total
        const itemDiscountPortion = (itemGrossTotal / saleGrossTotal) * saleDiscount
        const itemNetTotal = itemGrossTotal - itemDiscountPortion
        const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
        const profitAfterDiscount = profit - itemDiscountPortion

        csv += `${new Date(sale.timestamp).toLocaleTimeString()},${item.name},${item.quantity},${item.purchasePrice},${item.sellingPrice},${profitAfterDiscount},${itemNetTotal},${itemDiscountPortion}\n`
      })
    })

    return csv
  }

  prepareRangeSalesCSV() {
  const fromDate = new Date(document.getElementById("salesFromDate").value)
  const toDate = new Date(document.getElementById("salesToDate").value)

  if (!fromDate || !toDate) {
    showToast("Please select a valid date range first", "error")
    return ""
  }

  fromDate.setHours(0, 0, 0, 0)
  toDate.setHours(23, 59, 59, 999)

  const rangeSales = this.sales.filter((sale) => {
    const saleDate = sale.date ? new Date(sale.date) : new Date(sale.timestamp)
    return saleDate >= fromDate && saleDate <= toDate
  })

    let csv = "Date,Time,Product,Quantity,Purchase Price,Selling Price,Profit,Line Total,Discount\n"

    rangeSales.forEach((sale) => {
      const saleDiscount = sale.discount || 0
      const saleGrossTotal = sale.items.reduce((sum, item) => sum + item.total, 0)

      sale.items.forEach((item) => {
        const itemGrossTotal = item.total
        const itemDiscountPortion = (itemGrossTotal / saleGrossTotal) * saleDiscount
        const itemNetTotal = itemGrossTotal - itemDiscountPortion
        const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
        const profitAfterDiscount = profit - itemDiscountPortion

        csv += `${new Date(sale.timestamp).toLocaleDateString()},${new Date(sale.timestamp).toLocaleTimeString()},${item.name},${item.quantity},${item.purchasePrice},${item.sellingPrice},${profitAfterDiscount},${itemNetTotal},${itemDiscountPortion}\n`
      })
    })

    return csv
  }

  prepareDailyProcurementCSV() {
    const today = new Date().toDateString()
    const dailyProcurements = this.procurements.filter((proc) => new Date(proc.timestamp).toDateString() === today)

    let csv = "Time,Product,Quantity,Purchase Price,Selling Price,Line Total\n"

    dailyProcurements.forEach((proc) => {
      proc.items.forEach((item) => {
        csv += `${new Date(proc.timestamp).toLocaleTimeString()},${item.name},${item.quantity},${item.purchasePrice},${item.sellingPrice},${item.total}\n`
      })
    })

    return csv
  }

  prepareRangeProcurementCSV() {
    const fromDate = new Date(document.getElementById("procurementFromDate").value)
    const toDate = new Date(document.getElementById("procurementToDate").value)

    if (!fromDate || !toDate) {
      showToast("Please select a valid date range first", "error")
      return ""
    }

    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    const rangeProcurements = this.procurements.filter((proc) => {
      const procDate = new Date(proc.timestamp)
      return procDate >= fromDate && procDate <= toDate
    })

    let csv = "Date,Time,Product,Quantity,Purchase Price,Selling Price,Line Total\n"

    rangeProcurements.forEach((proc) => {
      proc.items.forEach((item) => {
        csv += `${new Date(proc.timestamp).toLocaleDateString()},${new Date(proc.timestamp).toLocaleTimeString()},${item.name},${item.quantity},${item.purchasePrice},${item.sellingPrice},${item.total}\n`
      })
    })

    return csv
  }

  saveSettings() {
    this.settings.shopName = document.getElementById("shopName").value
    this.settings.shopAddress = document.getElementById("shopAddress").value
    this.settings.shopPhone = document.getElementById("shopPhone").value
    this.settings.lowStockThreshold = Number.parseInt(document.getElementById("lowStockThreshold").value)
    this.settings.currency = document.getElementById("currency").value.trim()
    this.settings.darkMode = document.getElementById("darkModePreference").value

    this.saveData()
    this.applyTheme(this.settings.darkMode)
    this.updateCurrencySymbols()
    showToast("Settings saved successfully!", "success")
  }

  loadSettingsValues() {
    document.getElementById("shopName").value = this.settings.shopName
    document.getElementById("shopAddress").value = this.settings.shopAddress
    document.getElementById("shopPhone").value = this.settings.shopPhone
    document.getElementById("lowStockThreshold").value = this.settings.lowStockThreshold
    document.getElementById("currency").value = this.settings.currency
    document.getElementById("darkModePreference").value = this.settings.darkMode
  }

  showResetConfirmModal() {
    const modal = document.getElementById("resetConfirmModal")
    const confirmText = document.getElementById("confirmText")
    const confirmBtn = document.getElementById("confirmReset")
    const confirmError = document.getElementById("confirmError")

    confirmText.value = ""
    confirmBtn.disabled = true
    confirmError.style.display = "none"

    modal.style.display = "block"

    const handleInput = () => {
      const isValid = confirmText.value === "CONFIRM"
      confirmBtn.disabled = !isValid

      if (confirmText.value && !isValid) {
        confirmError.style.display = "block"
      } else {
        confirmError.style.display = "none"
      }
    }

    const handleConfirm = () => {
      if (confirmText.value === "CONFIRM") {
        this.resetAllData()
        modal.style.display = "none"
        confirmText.removeEventListener("input", handleInput)
        confirmBtn.removeEventListener("click", handleConfirm)
      }
    }

    const handleCancel = () => {
      modal.style.display = "none"
      confirmText.removeEventListener("input", handleInput)
      confirmBtn.removeEventListener("click", handleConfirm)
    }

    confirmText.addEventListener("input", handleInput)
    confirmBtn.addEventListener("click", handleConfirm)
    document.getElementById("cancelReset").addEventListener("click", handleCancel)
  }

  printReceiptContent() {
    const receiptContent = document.getElementById("receiptContent").innerHTML

    const printWindow = window.open("", "_blank", "width=400,height=600")

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 10px; 
              color: #000;
              background: #fff;
              font-size: 12px;
              line-height: 1.4;
            }
            .receipt-header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .receipt-header h2 { 
              margin: 0 0 5px 0; 
              font-size: 16px;
              font-weight: bold;
            }
            .receipt-header p { 
              margin: 2px 0; 
              font-size: 11px;
            }
            .receipt-items table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 10px; 
            }
            .receipt-items th, .receipt-items td { 
              padding: 2px 4px; 
              font-size: 11px;
            }
            .receipt-items th { 
              border-bottom: 1px solid #000;
              font-weight: bold;
            }
            .receipt-total { 
              margin-top: 10px; 
            }
            .receipt-footer { 
              text-align: center; 
              margin-top: 15px; 
              font-size: 11px;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .receipt-header, .receipt-items, .receipt-total, .receipt-footer {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `)

    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  initReceiptListeners() {
    document.getElementById("printReceipt").addEventListener("click", () => {
      this.printReceiptContent()
    })

    document.getElementById("closeReceipt").addEventListener("click", () => {
      this.hideModal("receiptModal")
    })
  }

  printInventory() {
    const printContent = this.prepareInventoryPrintContent()
    const title = `Inventory List - ${new Date().toLocaleDateString()}`

    const printWindow = window.open("", "_blank", "width=900,height=600")

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #000;
              background: #fff;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .header h1 { 
              margin: 0 0 10px 0; 
              font-size: 24px;
            }
            .header p { 
              margin: 5px 0; 
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f0f0f0; 
              font-weight: bold;
            }
            .totals { 
              margin-top: 20px; 
              font-weight: bold; 
              font-size: 14px;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 5px; 
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              @page {
                size: A4;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${this.settings.shopName}</h1>
            <p>${this.settings.shopAddress}</p>
            <p>Phone: ${this.settings.shopPhone}</p>
            <p><strong>${title}</strong></p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          ${printContent}
          <div class="footer">
            <p>This is a computer-generated report from ${this.settings.shopName}</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      setTimeout(() => {
        printWindow.close()
      }, 3000)
    }
  }

  prepareInventoryPrintContent() {
    let totalValue = 0

    const rows = this.products
      .map((product) => {
        const itemTotalValue = product.quantity * product.sellingPrice
        totalValue += itemTotalValue

        return `
          <tr>
            <td>${product.barcode}</td>
            <td>${product.name}</td>
            <td>${product.company}</td>
            <td>${product.quantity}</td>
            <td>${this.formatCurrency(product.purchasePrice)}</td>
            <td>${this.formatCurrency(product.sellingPrice)}</td>
            <td>${this.formatCurrency(itemTotalValue)}</td>
            <td>${new Date(product.dateUpdated || Date.now()).toLocaleDateString()}</td>
          </tr>
        `
      })
      .join("")

    return `
      <table>
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Item Name</th>
            <th>Company</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Selling Price</th>
            <th>Total Value</th>
            <th>Date Updated</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="8" style="text-align: center;">No inventory data available</td></tr>'}
        </tbody>
      </table>
      <div class="totals">
        <div class="total-row">
          <span>Total Inventory Value:</span>
          <span>${this.formatCurrency(totalValue)}</span>
        </div>
        <div class="total-row">
          <span>Total Items:</span>
          <span>${this.products.length}</span>
        </div>
      </div>
    `
  }
  // </CHANGE>

  // ========== SERVICES METHODS ==========
  loadServices() {
    this.updateServiceTypeDropdown()
    this.renderServicesList()
  }

  initServicesEventListeners() {
    const addServiceBtn = document.getElementById("addServiceBtn")
    const recordServiceBtn = document.getElementById("recordServiceBtn")
    const saveServiceBtn = document.getElementById("saveServiceBtn")
    const cancelServiceBtn = document.getElementById("cancelServiceBtn")

    if (addServiceBtn) {
      addServiceBtn.addEventListener("click", () => {
        this.showModal("addServiceModal")
        document.getElementById("newServiceName").focus()
      })
    }

    if (recordServiceBtn) {
      recordServiceBtn.addEventListener("click", () => {
        this.recordServiceSale()
      })
    }

    if (saveServiceBtn) {
      saveServiceBtn.addEventListener("click", () => {
        this.saveNewService()
      })
    }

    if (cancelServiceBtn) {
      cancelServiceBtn.addEventListener("click", () => {
        this.hideModal("addServiceModal")
      })
    }

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("service-delete-btn")) {
        const serviceId = e.target.dataset.serviceId
        this.showServiceDeleteConfirmation(serviceId)
      }
    })
  }

  updateServiceTypeDropdown() {
    const dropdown = document.getElementById("serviceType")
    if (!dropdown) return

    const currentValue = dropdown.value
    dropdown.innerHTML = '<option value="">Select a service</option>'

    this.services.forEach((service) => {
      const option = document.createElement("option")
      option.value = service.id
      option.textContent = service.name
      dropdown.appendChild(option)
    })

    dropdown.value = currentValue
  }

  renderServicesList() {
    const tbody = document.getElementById("servicesTableBody")
    if (!tbody) return

    // Filter out invalid services (those with undefined or missing data)
    const validServices = this.services.filter(
      (service) => service.name && service.name !== "undefined" && service.createdDate
    )

    if (validServices.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" style="text-align: center;">No services defined yet. Click "Add Service" to create one.</td></tr>'
      return
    }

    tbody.innerHTML = validServices
      .map(
        (service) =>`
      <tr>
        <td>${service.name}</td>
        <td>${service.unit || "N/A"}</td>
        <td>${new Date(service.createdDate).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-danger btn-sm service-delete-btn" data-service-id="${service.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      </tr>
    `
      )
      .join("")
  }

  saveNewService() {
    const nameInput = document.getElementById("newServiceName")
    const unitInput = document.getElementById("newServiceUnit")
    // const priceInput = document.getElementById("newServicePrice")

    if (!nameInput.value.trim()) {
      showToast("Please enter a service name", "error")
      nameInput.focus()
      return
    }

    if (!unitInput.value.trim()) {
      showToast("Please enter a unit for the service", "error")
      unitInput.focus()
      return
    }

    // if (!priceInput.value || Number(priceInput.value)) {
    //   showToast("Please enter a valid default price", "error")
    //   priceInput.focus()
    //   return
    // }

    const newService = {
      id: Date.now().toString(),
      name: nameInput.value.trim(),
      unit: unitInput.value.trim(),
      // defaultPrice: Number(priceInput.value),
      createdDate: new Date().toISOString(),
    }

    this.services.push(newService)
    this.saveData()
    this.loadServices()
    this.hideModal("addServiceModal")

    nameInput.value = ""
    unitInput.value = ""
    // priceInput.value = ""

    showToast(`Service "${newService.name}" created successfully!`, "success")
  }

  recordServiceSale() {
    const serviceTypeSelect = document.getElementById("serviceType")
    const custNameInput = document.getElementById("serviceCustName")
    const amountInput = document.getElementById("serviceAmount")
    const quantityInput = document.getElementById("serviceQuantity")

    if (!serviceTypeSelect.value) {
      showToast("Please select a service type", "error")
      serviceTypeSelect.focus()
      return
    }

    if (!amountInput.value || Number(amountInput.value) <= 0) {
      showToast("Please enter a valid amount", "error")
      amountInput.focus()
      return
    }

    const selectedService = this.services.find((s) => s.id === serviceTypeSelect.value)
    if (!selectedService) {
      showToast("Selected service not found", "error")
      return
    }

    const serviceSale = {
      id: Date.now().toString(),
      type: "service",
      serviceName: selectedService.name,
      serviceId: selectedService.id,
      serviceUnit: selectedService.unit || "N/A",
      quantity: Number(quantityInput.value) || 1,
      customerName: custNameInput.value.trim() || "N/A",
      amount: Number(amountInput.value),
      purchasePrice: 0,
      barcode: null,
      date: new Date().toISOString(),
      timestamp: new Date().toISOString(), // Added for date filtering compatibility
      time: new Date().toLocaleTimeString(),
      profit: Number(amountInput.value),
    }

    this.sales.push(serviceSale)
    this.saveData()
    
    // ============ CRITICAL FIX: Update all affected sections ============
    this.updateDashboard() // Updates dashboard cards and monthly totals
    
    // Trigger statements section refresh if visible
    const statementsTab = document.querySelector("[data-tab='daily-sales']")
    if (statementsTab && statementsTab.classList.contains("active")) {
      this.loadStatements() // Reload statements to show new service sale
    }

    // Clear form inputs
    serviceTypeSelect.value = ""
    custNameInput.value = ""
    amountInput.value = ""
    quantityInput.value = "1"

    showToast(`Service sale recorded: ${selectedService.name} (${serviceSale.quantity} ${selectedService.unit}) - ${this.formatCurrency(serviceSale.amount)}`, "success")
  }

  showServiceDeleteConfirmation(serviceId) {
    const service = this.services.find((s) => s.id === serviceId)
    if (!service) {
      showToast("Service not found", "error")
      return
    }

    this.pendingDeleteServiceId = serviceId
    const modal = document.getElementById("deleteConfirmModal")
    const confirmInput = document.getElementById("deleteConfirmText")
    const confirmBtn = document.getElementById("confirmDelete")
    const errorMsg = document.getElementById("deleteConfirmError")

    // Reset modal state
    confirmInput.value = ""
    confirmBtn.disabled = true
    errorMsg.style.display = "none"

    modal.style.display = "block"
  }

  deleteService(serviceId) {
    const service = this.services.find((s) => s.id === serviceId)
    if (!service) {
      showToast("Service not found", "error")
      return
    }

    this.services = this.services.filter((s) => s.id !== serviceId)
    this.saveData()
    this.loadServices()
    showToast(`Service "${service.name}" deleted successfully!`, "success")
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "block"
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "none"
    }
  }

  // ========== COST MANAGEMENT METHODS ==========
  initCostManagementEventListeners() {
    const addExpenseBtn = document.getElementById("addExpenseBtn")
    const generateExpenseReportBtn = document.getElementById("generateExpenseReport")
    const downloadStatementBtn = document.getElementById("downloadExpenseStatement")
    const generateProfitLossBtn = document.getElementById("generateProfitLossReport")
    const expenseDateInput = document.getElementById("expenseDate")

    // Set today's date as default
    if (expenseDateInput) {
      const today = new Date().toISOString().split("T")[0]
      expenseDateInput.value = today
    }

    if (addExpenseBtn) {
      addExpenseBtn.addEventListener("click", () => {
        this.addExpense()
      })
    }

    if (generateExpenseReportBtn) {
      generateExpenseReportBtn.addEventListener("click", () => {
        this.generateExpenseReport()
      })
    }

    // FIX #1: Use event delegation with event.stopImmediatePropagation() to prevent multiple downloads
    if (downloadStatementBtn) {
      // Remove any existing listeners to prevent duplication
      downloadStatementBtn.removeEventListener("click", this.boundDownloadHandler)
      // Create bound handler to maintain context
      this.boundDownloadHandler = () => {
        this.downloadExpenseStatement()
      }
      downloadStatementBtn.addEventListener("click", this.boundDownloadHandler)
    }

    if (generateProfitLossBtn) {
      generateProfitLossBtn.addEventListener("click", () => {
        this.generateProfitLossReport()
      })
    }

    // Set default dates for filters
    const today = new Date().toISOString().split("T")[0]
    const expenseStartDate = document.getElementById("expenseStartDate")
    const expenseEndDate = document.getElementById("expenseEndDate")
    const plStartDate = document.getElementById("plStartDate")
    const plEndDate = document.getElementById("plEndDate")

    if (expenseStartDate && expenseEndDate) {
      expenseStartDate.value = today
      expenseEndDate.value = today
    }

    if (plStartDate && plEndDate) {
      plStartDate.value = today
      plEndDate.value = today
    }

    // Delete expense button listeners using event delegation
    // Only attach once using a flag to prevent duplicate listeners
    if (!this.deleteExpenseListenerAttached) {
      document.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-expense-btn")) {
          e.stopPropagation()
          const expenseId = e.target.dataset.expenseId
          this.deleteExpense(expenseId)
        }
      })
      this.deleteExpenseListenerAttached = true
    }
  }

  loadCostManagement() {
    this.loadExpenses()
    this.generateExpenseReport()
    this.initCostManagementEventListeners()
  }

  loadExpenses() {
    const expenses = JSON.parse(localStorage.getItem("cyber_cafe_expenses") || "[]")
    this.renderExpenseTable(expenses)
  }

  addExpense() {
    const dateInput = document.getElementById("expenseDate")
    const descriptionInput = document.getElementById("expenseDescription")
    const amountInput = document.getElementById("expenseAmount")

    if (!dateInput.value) {
      showToast("Please select a date", "error")
      dateInput.focus()
      return
    }

    if (!descriptionInput.value.trim()) {
      showToast("Please enter an expense description", "error")
      descriptionInput.focus()
      return
    }

    if (!amountInput.value || Number(amountInput.value) <= 0) {
      showToast("Please enter a valid amount", "error")
      amountInput.focus()
      return
    }

    const expense = {
      id: Date.now().toString(),
      date: dateInput.value,
      description: descriptionInput.value.trim(),
      amount: Number(amountInput.value),
      timestamp: new Date().toISOString(),
    }

    const expenses = JSON.parse(localStorage.getItem("cyber_cafe_expenses") || "[]")
    expenses.push(expense)
    localStorage.setItem("cyber_cafe_expenses", JSON.stringify(expenses))

    // Clear form
    dateInput.value = new Date().toISOString().split("T")[0]
    descriptionInput.value = ""
    amountInput.value = ""

    this.loadExpenses()
    showToast("Expense added successfully!", "success")
  }

  deleteExpense(expenseId) {
    const confirmation = prompt('Type "CONFIRM" to delete this expense:')
    if (confirmation !== "CONFIRM") {
      showToast("Invalid input! Data not deleted.", "error")
      return
    }

    const expenses = JSON.parse(localStorage.getItem("cyber_cafe_expenses") || "[]")
    const filteredExpenses = expenses.filter((e) => e.id !== expenseId)
    localStorage.setItem("cyber_cafe_expenses", JSON.stringify(filteredExpenses))

    this.loadExpenses()
    showToast("Expense deleted successfully!", "success")
  }

  renderExpenseTable(expenses) {
    const tbody = document.querySelector("#expenseTable tbody")
    if (!tbody) return

    if (expenses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No expenses recorded</td></tr>'
      document.getElementById("totalExpenses").textContent = "0.00"
      return
    }

    let totalExpenses = 0
    tbody.innerHTML = expenses
      .map((expense) => {
        totalExpenses += expense.amount
        return `
          <tr>
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.description}</td>
            <td>${this.formatCurrency(expense.amount)}</td>
            <td>
              <button class="btn btn-danger btn-sm delete-expense-btn" data-expense-id="${expense.id}">
                <i class="fas fa-trash"></i> Delete
              </button>
            </td>
          </tr>
        `
      })
      .join("")

    document.getElementById("totalExpenses").textContent = this.formatCurrency(totalExpenses)
  }

  generateExpenseReport() {
    const startDate = document.getElementById("expenseStartDate")?.value
    const endDate = document.getElementById("expenseEndDate")?.value

    if (!startDate || !endDate) return

    const expenses = JSON.parse(localStorage.getItem("cyber_cafe_expenses") || "[]")
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return expenseDate >= start && expenseDate <= end
    })

    this.renderExpenseTable(filteredExpenses)
  }

  downloadExpenseStatement() {
    // FIX #1: Prevent multiple rapid clicks and event bubbling
    const downloadBtn = document.getElementById("downloadExpenseStatement")
    if (downloadBtn) {
      downloadBtn.disabled = true
      setTimeout(() => {
        downloadBtn.disabled = false
      }, 2000)
    }

    const startDate = document.getElementById("expenseStartDate")?.value
    const endDate = document.getElementById("expenseEndDate")?.value

    if (!startDate || !endDate) {
      showToast("Please select date range", "error")
      return
    }

    const expenses = JSON.parse(localStorage.getItem("cyber_cafe_expenses") || "[]")
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return expenseDate >= start && expenseDate <= end
    })

    if (filteredExpenses.length === 0) {
      showToast("No data to export", "warning")
      return
    }

    // Check if html2pdf library is loaded
    if (typeof window.html2pdf === "undefined") {
      showToast("PDF export library not loaded. Please refresh the page.", "error")
      console.error("html2pdf library is not loaded")
      return
    }

    // Create HTML content for PDF
    let totalAmount = 0
    const tableRows = filteredExpenses
      .map((expense) => {
        totalAmount += expense.amount
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date(expense.date).toLocaleDateString()}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${expense.description}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatCurrency(expense.amount)}</td>
          </tr>
        `
      })
      .join("")

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="text-align: center; color: #2563eb; margin-bottom: 10px;">Expense Report</h2>
        <p style="text-align: center; color: #666; margin-bottom: 20px;">
          ${this.settings.shopName}
        </p>
        <p style="color: #666; margin: 5px 0;">
          <strong>Report Period:</strong> ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}
        </p>
        <p style="color: #666; margin: 5px 0; margin-bottom: 20px;">
          <strong>Generated on:</strong> ${new Date().toLocaleString()}
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f0f4f8;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #2563eb; font-weight: 600;">Date</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #2563eb; font-weight: 600;">Description</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #2563eb; font-weight: 600;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
            <tr style="background-color: #f0f4f8; font-weight: 600;">
              <td colspan="2" style="padding: 12px; text-align: right;">Total Expenses:</td>
              <td style="padding: 12px; text-align: right; border-top: 2px solid #2563eb;">${this.formatCurrency(totalAmount)}</td>
            </tr>
          </tbody>
        </table>
        
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          This is a computer-generated report from ${this.settings.shopName}
        </p>
      </div>
    `

    const element = document.createElement("div")
    element.innerHTML = htmlContent

    const options = {
      margin: 10,
      filename: `Expense_Statement_${startDate}_to_${endDate}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    }

    window.html2pdf().set(options).from(element).save()
    showToast("PDF downloaded successfully!", "success")
  }

  generateProfitLossReport() {
    // FIX #2: Sync with Statement section date range if P/L dates are not set
    const plStartDateEl = document.getElementById("plStartDate")
    const plEndDateEl = document.getElementById("plEndDate")
    const statementStartDateEl = document.getElementById("salesFromDate")
    const statementEndDateEl = document.getElementById("salesToDate")

    let startDate = plStartDateEl?.value
    let endDate = plEndDateEl?.value

    // If P/L dates are not set, try to use Statement dates
    if (!startDate && statementStartDateEl?.value) {
      startDate = statementStartDateEl.value
      if (plStartDateEl) plStartDateEl.value = startDate
    }

    if (!endDate && statementEndDateEl?.value) {
      endDate = statementEndDateEl.value
      if (plEndDateEl) plEndDateEl.value = endDate
    }

    if (!startDate || !endDate) {
      showToast("Please select date range", "error")
      return
    }

    // Parse dates for proper comparison using date string parsing
    // This ensures exact date matching without timezone issues
    const start = new Date(startDate + "T00:00:00")
    const end = new Date(endDate + "T23:59:59")

    let salesIncome = 0
    let servicesIncome = 0

    // Filter sales by date range and separate product sales from service sales
    this.sales.forEach((sale) => {
      const saleTimestamp = sale.date || sale.timestamp
      const saleDate = new Date(saleTimestamp)
      
      // Normalize to date only for comparison
      const saleDateOnly = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate())
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      
      if (saleDateOnly >= startDateOnly && saleDateOnly <= endDateOnly) {
        if (sale.type === "service") {
          // Service income
          servicesIncome += sale.amount || 0
        } else {
          // Product sales income (use finalTotal if available, otherwise calculate from items)
          if (sale.finalTotal) {
            salesIncome += sale.finalTotal
          } else if (sale.finalAmount) {
            salesIncome += sale.finalAmount
          } else if (sale.items && sale.items.length > 0) {
            const itemsTotal = sale.items.reduce((sum, item) => sum + (item.total || 0), 0)
            const discountAmount = sale.discount || 0
            salesIncome += itemsTotal - discountAmount
          } else {
            salesIncome += sale.grandTotal || 0
          }
        }
      }
    })

    // Calculate total expenses
    const expenses = JSON.parse(localStorage.getItem("cyber_cafe_expenses") || "[]")
    const totalExpenses = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        // Normalize to date only for comparison
        const expenseDateOnly = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate())
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())
        
        return expenseDateOnly >= startDateOnly && expenseDateOnly <= endDateOnly
      })
      .reduce((sum, expense) => sum + expense.amount, 0)

    const totalIncome = salesIncome + servicesIncome
    const netProfit = totalIncome - totalExpenses

    // Update dashboard cards with proper formatting
    const plTotalIncomeEl = document.getElementById("plTotalIncome")
    const plTotalExpensesEl = document.getElementById("plTotalExpenses")
    const plNetProfitEl = document.getElementById("plNetProfit")
    const plSalesIncomeEl = document.getElementById("plSalesIncome")
    const plServicesIncomeEl = document.getElementById("plServicesIncome")

    if (plTotalIncomeEl) plTotalIncomeEl.textContent = this.formatCurrency(totalIncome)
    if (plTotalExpensesEl) plTotalExpensesEl.textContent = this.formatCurrency(totalExpenses)
    if (plNetProfitEl) plNetProfitEl.textContent = this.formatCurrency(netProfit)
    if (plSalesIncomeEl) plSalesIncomeEl.textContent = this.formatCurrency(salesIncome)
    if (plServicesIncomeEl) plServicesIncomeEl.textContent = this.formatCurrency(servicesIncome)

    // Render expense breakdown
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      // Normalize to date only for comparison
      const expenseDateOnly = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate())
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      
      return expenseDateOnly >= startDateOnly && expenseDateOnly <= endDateOnly
    })
    this.renderExpenseBreakdown(filteredExpenses)

    showToast("Profit/Loss report generated successfully", "success")
  }

  renderExpenseBreakdown(expenses) {
    const tbody = document.querySelector("#expenseBreakdownTable tbody")
    if (!tbody) return

    if (expenses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">No expenses in this period</td></tr>'
      return
    }

    tbody.innerHTML = expenses
      .map(
        (expense) =>
          `
          <tr>
            <td>${expense.description}</td>
            <td>${this.formatCurrency(expense.amount)}</td>
          </tr>
        `
      )
      .join("")
  }
}

// ========== CUSTOMER MANAGEMENT EXTENSION ==========
ShopManager.prototype.initCustomerManagement = function() {
  this.customers = []
  this.customerLedgers = {} // { customerId: [transactions] }
  this.currentViewingCustomerId = null
  this.editingCustomerId = null
  this.loadCustomers()
  this.initCustomerEventListeners()
}

ShopManager.prototype.loadCustomers = function() {
  const savedCustomers = localStorage.getItem("shop_customers")
  const savedLedgers = localStorage.getItem("shop_customer_ledgers")
  
  if (savedCustomers) this.customers = JSON.parse(savedCustomers)
  if (savedLedgers) this.customerLedgers = JSON.parse(savedLedgers)
}

ShopManager.prototype.saveCustomers = function() {
  try {
    localStorage.setItem("shop_customers", JSON.stringify(this.customers))
    localStorage.setItem("shop_customer_ledgers", JSON.stringify(this.customerLedgers))
  } catch (error) {
    console.error("Error saving customers:", error)
    showToast("Error saving customer data.", "error")
  }
}

ShopManager.prototype.initCustomerEventListeners = function() {
  const addCustomerBtn = document.getElementById("addCustomerBtn")
  const saveCustomerBtn = document.getElementById("saveCustomerBtn")
  const addTransactionBtn = document.getElementById("addTransactionBtn")
  const backToCustomersBtn = document.getElementById("backToCustomersBtn")
  const customerSearch = document.getElementById("customerSearch")
  const addCustomerModal = document.getElementById("addCustomerModal")
  const printLedgerBtn = document.getElementById("printLedgerBtn")
  const closePrintBtn = document.getElementById("closePrintBtn")
  
  if (addCustomerBtn) {
    addCustomerBtn.addEventListener("click", () => {
      this.editingCustomerId = null
      document.getElementById("customerModalTitle").textContent = "Add New Customer"
      document.getElementById("modalCustomerName").value = ""
      document.getElementById("modalCustomerPhone").value = ""
      document.getElementById("modalCustomerAddress").value = ""
      addCustomerModal.style.display = "block"
    })
  }
  
  if (saveCustomerBtn) {
    saveCustomerBtn.addEventListener("click", () => {
      this.saveCustomer()
    })
  }
  
  if (addTransactionBtn) {
    addTransactionBtn.addEventListener("click", () => {
      this.addTransaction()
    })
  }
  
  if (backToCustomersBtn) {
    backToCustomersBtn.addEventListener("click", () => {
      this.showCustomerList()
    })
  }
  
  if (printLedgerBtn) {
    printLedgerBtn.addEventListener("click", () => {
      if (this.currentViewingCustomerId) {
        this.printLedgerStatement(this.currentViewingCustomerId)
      } else {
        showToast("No customer selected", "warning")
      }
    })
  }
  
  if (closePrintBtn) {
    closePrintBtn.addEventListener("click", () => {
      document.getElementById("printStatementContainer").style.display = "none"
    })
  }
  
  if (customerSearch) {
    const debouncedSearch = debounce((value) => {
      this.searchCustomers(value)
    }, 200)
    
    customerSearch.addEventListener("input", (e) => {
      debouncedSearch(e.target.value)
    })
  }
  
  // Close modal handlers
  document.querySelectorAll("#addCustomerModal .close, #addCustomerModal .close-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      addCustomerModal.style.display = "none"
    })
  })
}

ShopManager.prototype.saveCustomer = function() {
  const name = document.getElementById("modalCustomerName").value.trim()
  const phone = document.getElementById("modalCustomerPhone").value.trim()
  const address = document.getElementById("modalCustomerAddress").value.trim()
  
  if (!name || !phone) {
    showToast("Please fill in all required fields", "warning")
    return
  }
  
  const customerId = this.editingCustomerId || "cust_" + Date.now()
  
  if (this.editingCustomerId) {
    // Edit existing customer
    const customer = this.customers.find(c => c.id === customerId)
    if (customer) {
      customer.name = name
      customer.phone = phone
      customer.address = address
    }
  } else {
    // Add new customer
    const customer = {
      id: customerId,
      name: name,
      phone: phone,
      address: address,
      createdAt: new Date().toISOString()
    }
    this.customers.push(customer)
    this.customerLedgers[customerId] = []
  }
  
  this.saveCustomers()
  document.getElementById("addCustomerModal").style.display = "none"
  this.renderCustomerList()
  showToast(`Customer "${name}" saved successfully`, "success")
}

ShopManager.prototype.renderCustomerList = function() {
  const tbody = document.getElementById("customersTableBody")
  
  if (this.customers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No customers yet. Click "Add New Customer" to get started.</td></tr>'
    return
  }
  
  tbody.innerHTML = this.customers.map(customer => {
    const ledger = this.customerLedgers[customer.id] || []
    const balance = this.calculateBalance(ledger)
    const balanceClass = balance > 0 ? "customer-balance-negative" : "customer-balance-positive"
    
    return `
      <tr>
        <td>${customer.name}</td>
        <td>${customer.phone}</td>
        <td>${customer.address}</td>
        <td class="${balanceClass}">${formatIndianNumber(Math.abs(balance))}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="shopManager.viewCustomerLedger('${customer.id}')" style="margin-right: 0.5rem;">View</button>
          <button class="btn btn-secondary btn-sm" onclick="shopManager.editCustomer('${customer.id}')" style="margin-right: 0.5rem;">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="shopManager.deleteCustomer('${customer.id}')">Delete</button>
        </td>
      </tr>
    `
  }).join("")
}

ShopManager.prototype.calculateBalance = function(ledger) {
  let balance = 0
  ledger.forEach(transaction => {
    balance += parseFloat(transaction.debit) || 0
    balance -= parseFloat(transaction.credit) || 0
  })
  return balance
}

ShopManager.prototype.viewCustomerLedger = function(customerId) {
  this.currentViewingCustomerId = customerId
  const customer = this.customers.find(c => c.id === customerId)
  
  if (!customer) {
    showToast("Customer not found", "error")
    return
  }
  
  document.getElementById("customerName").textContent = customer.name
  document.getElementById("customerPhone").textContent = customer.phone
  document.getElementById("customerAddress").textContent = customer.address
  
  const ledger = this.customerLedgers[customerId] || []
  const balance = this.calculateBalance(ledger)
  document.getElementById("customerBalance").textContent = formatIndianNumber(Math.abs(balance)) + (balance > 0 ? " (ধার)" : " (জমা)")
  
  this.renderLedger(customerId)
  
  document.getElementById("customerListView").style.display = "none"
  document.getElementById("customerLedgerView").style.display = "block"
  
  // Reset transaction form
  document.getElementById("debitAmount").value = ""
  document.getElementById("creditAmount").value = ""
  document.getElementById("transactionDescription").value = ""
}

ShopManager.prototype.renderLedger = function(customerId) {
  const ledger = this.customerLedgers[customerId] || []
  const tbody = document.getElementById("ledgerTableBody")
  
  // Calculate summary values
  let totalDebit = 0
  let totalCredit = 0
  
  ledger.forEach(transaction => {
    totalDebit += parseFloat(transaction.debit) || 0
    totalCredit += parseFloat(transaction.credit) || 0
  })
  
  const netBalance = totalDebit - totalCredit
  
  // Update summary display
  const totalDebitEl = document.getElementById("totalDebit")
  const totalCreditEl = document.getElementById("totalCredit")
  const netBalanceEl = document.getElementById("netBalance")
  
  if (totalDebitEl) totalDebitEl.textContent = formatIndianNumber(totalDebit)
  if (totalCreditEl) totalCreditEl.textContent = formatIndianNumber(totalCredit)
  if (netBalanceEl) {
    netBalanceEl.textContent = formatIndianNumber(Math.abs(netBalance))
    netBalanceEl.style.color = netBalance > 0 ? 'var(--danger)' : 'var(--success)'
  }
  
  if (ledger.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No transactions yet.</td></tr>'
    return
  }
  
  let runningBalance = 0
  tbody.innerHTML = ledger.map((transaction, index) => {
    runningBalance += parseFloat(transaction.debit) || 0
    runningBalance -= parseFloat(transaction.credit) || 0
    
    const debitDisplay = transaction.debit ? `<span class="ledger-debit">${formatIndianNumber(transaction.debit)}</span>` : "-"
    const creditDisplay = transaction.credit ? `<span class="ledger-credit">${formatIndianNumber(transaction.credit)}</span>` : "-"
    
    return `
      <tr>
        <td>${transaction.timestamp}</td>
        <td>${transaction.description}</td>
        <td>${debitDisplay}</td>
        <td>${creditDisplay}</td>
        <td><strong>${formatIndianNumber(Math.abs(runningBalance))}</strong></td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="shopManager.deleteTransaction('${customerId}', ${index})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `
  }).join("")
}

ShopManager.prototype.addTransaction = function() {
  const debit = parseFloat(document.getElementById("debitAmount").value) || 0
  const credit = parseFloat(document.getElementById("creditAmount").value) || 0
  const description = document.getElementById("transactionDescription").value.trim()
  
  if (debit === 0 && credit === 0) {
    showToast("Please enter either debit or credit amount", "warning")
    return
  }
  
  if (!description) {
    showToast("Please enter a description", "warning")
    return
  }
  
  const customerId = this.currentViewingCustomerId
  if (!customerId) {
    showToast("No customer selected", "error")
    return
  }
  
  const now = new Date()
  const timestamp = now.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
  
  const transaction = {
    timestamp: timestamp,
    description: description,
    debit: debit,
    credit: credit
  }
  
  if (!this.customerLedgers[customerId]) {
    this.customerLedgers[customerId] = []
  }
  
  this.customerLedgers[customerId].push(transaction)
  this.saveCustomers()
  this.renderLedger(customerId)
  this.renderCustomerList()
  this.viewCustomerLedger(customerId)
  
  showToast("Transaction added successfully", "success")
}

ShopManager.prototype.deleteTransaction = function(customerId, index) {
  if (!this.customerLedgers[customerId]) return
  
  this.customerLedgers[customerId].splice(index, 1)
  this.saveCustomers()
  this.renderLedger(customerId)
  this.renderCustomerList()
  showToast("Transaction deleted successfully", "success")
}

ShopManager.prototype.showCustomerList = function() {
  document.getElementById("customerListView").style.display = "block"
  document.getElementById("customerLedgerView").style.display = "none"
  this.renderCustomerList()
}

ShopManager.prototype.searchCustomers = function(query) {
  const tbody = document.getElementById("customersTableBody")
  
  if (!query.trim()) {
    this.renderCustomerList()
    return
  }
  
  const filtered = this.customers.filter(customer => 
    customer.name.toLowerCase().includes(query.toLowerCase()) ||
    customer.phone.includes(query)
  )
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No customers found.</td></tr>'
    return
  }
  
  tbody.innerHTML = filtered.map(customer => {
    const ledger = this.customerLedgers[customer.id] || []
    const balance = this.calculateBalance(ledger)
    const balanceClass = balance > 0 ? "customer-balance-negative" : "customer-balance-positive"
    
    return `
      <tr>
        <td>${customer.name}</td>
        <td>${customer.phone}</td>
        <td>${customer.address}</td>
        <td class="${balanceClass}">${formatIndianNumber(Math.abs(balance))}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="shopManager.viewCustomerLedger('${customer.id}')" style="margin-right: 0.5rem;">View</button>
          <button class="btn btn-secondary btn-sm" onclick="shopManager.editCustomer('${customer.id}')" style="margin-right: 0.5rem;">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="shopManager.deleteCustomer('${customer.id}')">Delete</button>
        </td>
      </tr>
    `
  }).join("")
}

ShopManager.prototype.editCustomer = function(customerId) {
  const customer = this.customers.find(c => c.id === customerId)
  if (!customer) return
  
  this.editingCustomerId = customerId
  document.getElementById("customerModalTitle").textContent = "Edit Customer"
  document.getElementById("modalCustomerName").value = customer.name
  document.getElementById("modalCustomerPhone").value = customer.phone
  document.getElementById("modalCustomerAddress").value = customer.address
  document.getElementById("addCustomerModal").style.display = "block"
}

ShopManager.prototype.deleteCustomer = function(customerId) {
  if (!confirm("Are you sure you want to delete this customer and their ledger?")) return
  
  this.customers = this.customers.filter(c => c.id !== customerId)
  delete this.customerLedgers[customerId]
  this.saveCustomers()
  this.renderCustomerList()
  showToast("Customer deleted successfully", "success")
}

ShopManager.prototype.printLedgerStatement = function(customerId) {
  const customer = this.customers.find(c => c.id === customerId)
  if (!customer) {
    showToast("Customer not found", "error")
    return
  }
  
  const ledger = this.customerLedgers[customerId] || []
  const balance = this.calculateBalance(ledger)
  
  let runningBalance = 0
  let totalDebit = 0
  let totalCredit = 0
  
  // Calculate totals
  ledger.forEach((transaction) => {
    totalDebit += parseFloat(transaction.debit) || 0
    totalCredit += parseFloat(transaction.credit) || 0
  })
  
  const currentDate = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
  
  const finalBalance = Math.abs(balance)
  const balanceStatus = balance > 0 ? "CUSTOMER OWES" : "CUSTOMER CREDIT"
  
  const printContent = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding: 20px;
        background-color: #f8f9fa;
      }
      .statement-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .statement-header {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white;
        text-align: center;
        padding: 2.5rem 2rem;
        position: relative;
      }
      .statement-header .shop-name {
        color: #1a202c;
        background: white;
        padding: 0.75rem 1.5rem;
        display: inline-block;
        border-radius: 6px;
        margin-top: 0.5rem;
        font-weight: 700;
        font-size: 1.1rem;
      }
        overflow: hidden;
      }
      .statement-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
        pointer-events: none;
      }
      .statement-header h1 {
        margin: 0;
        font-size: 2.2rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        position: relative;
        z-index: 1;
      }
      .statement-header p {
        margin: 0.5rem 0 0 0;
        color: rgba(255,255,255,0.9);
        font-size: 0.95rem;
        position: relative;
        z-index: 1;
      }
      .content-wrapper {
        padding: 2rem;
      }
      .customer-info {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: linear-gradient(135deg, #f0f7ff 0%, #e0f2ff 100%);
        border-radius: 10px;
        border-left: 5px solid #2563eb;
      }
      .customer-info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
        padding: 0.5rem 0;
      }
      .info-label {
        font-weight: 600;
        color: #1e40af;
        min-width: 140px;
        font-size: 0.95rem;
      }
      .info-value {
        color: #334155;
        font-weight: 500;
        text-align: right;
        flex: 1;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 2rem;
        font-size: 0.95rem;
      }
      table thead {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white;
      }
      table th {
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.5px;
      }
      table th:nth-child(4),
      table th:nth-child(5),
      table th:nth-child(6) {
        text-align: right;
      }
      table tbody tr {
        border-bottom: 1px solid #e2e8f0;
      }
      table tbody tr:nth-child(even) {
        background-color: #f8f9fa;
      }
      table td {
        padding: 0.9rem 1rem;
      }
      table td:nth-child(4),
      table td:nth-child(5),
      table td:nth-child(6) {
        text-align: right;
        font-family: 'Courier New', monospace;
      }
      table td:nth-child(1) {
        color: #64748b;
        font-weight: 500;
        text-align: center;
      }
      .totals-row {
        background: linear-gradient(135deg, #e0f2ff 0%, #f0f7ff 100%);
        font-weight: 700;
        border-top: 2px solid #2563eb;
        border-bottom: 2px solid #2563eb;
        color: #1e40af;
      }
      .summary-section {
        margin: 2rem 0;
        padding: 1.5rem;
        background: linear-gradient(135deg, #f8fafb 0%, #f0f7ff 100%);
        border: 2px solid #e0f2ff;
        border-radius: 10px;
      }
      .summary-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1e40af;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.85rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e0f2ff;
      }
      .summary-row:last-child {
        border-bottom: none;
      }
      .summary-row span:first-child {
        font-weight: 600;
        color: #334155;
      }
      .summary-row span:last-child {
        font-weight: 700;
        color: #1e40af;
        font-family: 'Courier New', monospace;
        font-size: 1.05rem;
      }
      .balance-status {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        padding: 1.5rem;
        text-align: center;
        font-size: 1.3rem;
        font-weight: 700;
        border-radius: 10px;
        margin-top: 1.5rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
      }
      .balance-status.credit {
        background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
        box-shadow: 0 4px 15px rgba(22, 163, 74, 0.3);
      }
      .footer {
        text-align: center;
        margin-top: 2.5rem;
        padding-top: 1.5rem;
        border-top: 2px solid #e2e8f0;
        color: #64748b;
        font-size: 0.85rem;
        line-height: 1.6;
      }
      .footer p {
        margin: 0.3rem 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
          background: white;
        }
        .statement-container {
          box-shadow: none;
        }
      }
    </style>
    <div style="font-family: Arial, sans-serif; max-width: 850px; margin: 0 auto; padding: 30px 20px; background: white;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 15px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #1a202c;">One-Stop Cyber Cafe</h2>
        <p style="margin: 3px 0 0 0; font-size: 12px; color: #333;">${customer.address}</p>
        <p style="margin: 2px 0; font-size: 12px; color: #333;">Phone: ${customer.phone}</p>
      </div>

      <!-- Statement Title -->
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 3px 0; font-size: 13px; font-weight: 700; color: #1a202c;">Customer Ledger Statement</h3>
        <p style="margin: 0; font-size: 11px; color: #666;">Generated on: ${currentDate}</p>
      </div>

      <!-- Customer Info -->
      <div style="margin-bottom: 20px; padding: 10px 0; border-bottom: 1px solid #ddd;">
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Customer Name:</strong> ${customer.name}</p>
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Phone Number:</strong> ${customer.phone}</p>
        <p style="margin: 0; font-size: 13px;"><strong>Address:</strong> ${customer.address}</p>
      </div>

      <!-- Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <thead>
          <tr style="background: #f0f0f0; border: 1px solid #333;">
            <th style="padding: 10px 8px; text-align: left; border: 1px solid #333; font-weight: 700; color: #1a202c;">Date</th>
            <th style="padding: 10px 8px; text-align: left; border: 1px solid #333; font-weight: 700; color: #1a202c;">Purpose</th>
            <th style="padding: 10px 8px; text-align: right; border: 1px solid #333; font-weight: 700; color: #1a202c;">Debit</th>
            <th style="padding: 10px 8px; text-align: right; border: 1px solid #333; font-weight: 700; color: #1a202c;">Credit</th>
            <th style="padding: 10px 8px; text-align: right; border: 1px solid #333; font-weight: 700; color: #1a202c;">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${ledger.map((transaction, index) => {
            runningBalance += parseFloat(transaction.debit) || 0
            runningBalance -= parseFloat(transaction.credit) || 0
            const debit = transaction.debit ? transaction.debit.toFixed(2) : ''
            const credit = transaction.credit ? transaction.credit.toFixed(2) : ''
            
            return `
              <tr style="border: 1px solid #ddd;">
                <td style="padding: 8px; border: 1px solid #ddd; color: #333;">${transaction.timestamp}</td>
                <td style="padding: 8px; border: 1px solid #ddd; color: #333;">${transaction.description}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #ddd; color: #dc2626; font-weight: 600;">${debit}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #ddd; color: #16a34a; font-weight: 600;">${credit}</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #ddd; font-weight: 600;">${Math.abs(runningBalance).toFixed(2)}</td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>

      <!-- Summary -->
      <div style="margin-bottom: 20px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
          <span style="font-weight: 700; color: #1a202c;">Total Debit (ধার):</span>
          <span style="color: #dc2626; font-weight: 600;">${totalDebit.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
          <span style="font-weight: 700; color: #1a202c;">Total Credit (জমা):</span>
          <span style="color: #16a34a; font-weight: 600;">${totalCredit.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #333; border-bottom: 2px solid #333; margin-top: 8px;">
          <span style="font-weight: 700; color: #1a202c;">Balance:</span>
          <span style="font-weight: 700; color: #1a202c;">${(totalDebit - totalCredit).toFixed(2)}</span>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px;">
        <p style="margin: 0;">This is a system-generated statement.</p>
      </div>
    </div>
  `
  
  const printWindow = window.open("", "_blank", "width=900,height=600")
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Customer Ledger Statement</title>
    </head>
    <body style="margin: 20px; padding: 0; font-family: Arial, sans-serif;">
      ${printContent}
    </body>
    </html>
  `)
  printWindow.document.close()
  
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
}

// ==================== BANK MANAGEMENT CLASS ====================
class BankManager {
  constructor() {
    this.transactions = []
    this.filteredTransactions = []
    this.balance = 0
    this.deleteModalActive = false
    this.deleteTransactionIndex = null
    
    this.loadTransactions()
    this.init()
  }

  init() {
    this.initializeEventListeners()
    this.setTodayDate()
    this.renderLedger()
  }

  initializeEventListeners() {
    // Add Transaction
    const addBtn = document.getElementById('addBankTransaction')
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addTransaction())
    }

    // Filter Statement
    const filterBtn = document.getElementById('filterBankStatement')
    if (filterBtn) {
      filterBtn.addEventListener('click', () => this.filterStatement())
    }

    // Reset Filter
    const resetBtn = document.getElementById('resetBankFilter')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilter())
    }

    // Print Statement
    const printBtn = document.getElementById('printBankStatement')
    if (printBtn) {
      printBtn.addEventListener('click', () => this.printStatement())
    }

    // Enter key for date, amount fields
    const dateInput = document.getElementById('bankDate')
    const amountInput = document.getElementById('bankAmount')
    
    if (dateInput) {
      dateInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addTransaction()
      })
    }
    if (amountInput) {
      amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addTransaction()
      })
    }
  }

  setTodayDate() {
    const today = new Date().toISOString().split('T')[0]
    const dateInput = document.getElementById('bankDate')
    if (dateInput && !dateInput.value) {
      dateInput.value = today
    }
    
    const fromDate = document.getElementById('bankFromDate')
    const toDate = document.getElementById('bankToDate')
    if (fromDate && !fromDate.value) {
      fromDate.value = today
    }
    if (toDate && !toDate.value) {
      toDate.value = today
    }
  }

  addTransaction() {
    const dateInput = document.getElementById('bankDate')
    const typeInput = document.getElementById('bankType')
    const purposeInput = document.getElementById('bankPurpose')
    const amountInput = document.getElementById('bankAmount')

    if (!dateInput.value || !purposeInput.value.trim() || !amountInput.value) {
      showToast('Please fill all fields', 'warning')
      return
    }

    const date = dateInput.value
    const type = typeInput.value
    const purpose = purposeInput.value.trim()
    const amount = parseFloat(amountInput.value)

    if (amount <= 0) {
      showToast('Amount must be greater than 0', 'warning')
      return
    }

    const transaction = {
      id: Date.now(),
      date,
      type,
      purpose,
      amount,
      timestamp: new Date().toISOString()
    }

    this.transactions.push(transaction)
    this.transactions.sort((a, b) => new Date(a.date) - new Date(b.date))
    this.saveTransactions()
    this.renderLedger()
    
    // Clear form
    dateInput.value = new Date().toISOString().split('T')[0]
    typeInput.value = 'deposit'
    purposeInput.value = ''
    amountInput.value = ''
    
    showToast('Transaction added successfully', 'success')
  }

  calculateBalance(upToIndex = null) {
    let balance = 0
    const transactionsToCalc = upToIndex !== null 
      ? this.filteredTransactions.slice(0, upToIndex + 1)
      : this.filteredTransactions

    for (let i = transactionsToCalc.length - 1; i >= 0; i--) {
      const trans = transactionsToCalc[i]
      if (trans.type === 'deposit') {
        balance += trans.amount
      } else {
        balance -= trans.amount
      }
    }
    return balance
  }

  renderLedger() {
    if (this.filteredTransactions.length === 0) {
      this.filteredTransactions = [...this.transactions]
    }

    const tbody = document.getElementById('bankLedgerBody')
    if (!tbody) return

    // Calculate summary data
    let openingBalance = 0
    let totalDeposits = 0
    let totalWithdrawals = 0
    let closingBalance = 0

    // Calculate opening balance (before filtered transactions)
    const filteredDates = this.filteredTransactions.map(t => t.date)
    const minDate = filteredDates.length ? new Date(Math.min(...filteredDates.map(d => new Date(d)))) : null
    
    if (minDate) {
      const beforeFiltered = this.transactions.filter(t => new Date(t.date) < minDate)
      beforeFiltered.forEach(t => {
        if (t.type === 'deposit') {
          openingBalance += t.amount
        } else {
          openingBalance -= t.amount
        }
      })
    }

    closingBalance = openingBalance

    // Calculate totals and closing balance for filtered transactions
    this.filteredTransactions.forEach(t => {
      if (t.type === 'deposit') {
        totalDeposits += t.amount
        closingBalance += t.amount
      } else {
        totalWithdrawals += t.amount
        closingBalance -= t.amount
      }
    })

    // Update summary display
    const openingEl = document.getElementById('openingBalance')
    const depositsEl = document.getElementById('totalDeposits')
    const withdrawalsEl = document.getElementById('totalWithdrawals')
    const closingEl = document.getElementById('closingBalance')

    if (openingEl) openingEl.textContent = formatIndianNumber(openingBalance)
    if (depositsEl) depositsEl.textContent = formatIndianNumber(totalDeposits)
    if (withdrawalsEl) withdrawalsEl.textContent = formatIndianNumber(totalWithdrawals)
    if (closingEl) closingEl.textContent = formatIndianNumber(closingBalance)

    // Render ledger table
    if (this.filteredTransactions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-secondary);">
            No transactions yet. Add one to get started.
          </td>
        </tr>
      `
      return
    }

    tbody.innerHTML = ''
    let runningBalance = openingBalance

    this.filteredTransactions.forEach((transaction, index) => {
      if (transaction.type === 'deposit') {
        runningBalance += transaction.amount
      } else {
        runningBalance -= transaction.amount
      }

      const row = document.createElement('tr')
      const formattedDate = new Date(transaction.date).toLocaleDateString('en-GB')
      const depositDisplay = transaction.type === 'deposit' ? formatIndianNumber(transaction.amount) : '-'
      const withdrawalDisplay = transaction.type === 'withdrawal' ? formatIndianNumber(transaction.amount) : '-'
      const balanceDisplay = formatIndianNumber(runningBalance)

      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${transaction.purpose}</td>
        <td class="${transaction.type === 'deposit' ? 'deposit' : ''}">${depositDisplay}</td>
        <td class="${transaction.type === 'withdrawal' ? 'withdrawal' : ''}">${withdrawalDisplay}</td>
        <td class="balance">${balanceDisplay}</td>
        <td>
          <button class="delete-btn" data-id="${transaction.id}" title="Delete transaction">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `

      // Delete button event
      const deleteBtn = row.querySelector('.delete-btn')
      deleteBtn.addEventListener('click', () => {
        this.deleteTransactionIndex = this.transactions.findIndex(t => t.id === transaction.id)
        this.showDeleteConfirmation()
      })

      tbody.appendChild(row)
    })
  }

  filterStatement() {
    const fromDate = document.getElementById('bankFromDate').value
    const toDate = document.getElementById('bankToDate').value

    if (!fromDate || !toDate) {
      showToast('Please select both dates', 'warning')
      return
    }

    const from = new Date(fromDate)
    const to = new Date(toDate)

    if (from > to) {
      showToast('From date must be before To date', 'warning')
      return
    }

    this.filteredTransactions = this.transactions.filter(t => {
      const transDate = new Date(t.date)
      return transDate >= from && transDate <= to
    })

    this.filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date))

    this.renderLedger()
    showToast('Statement filtered successfully', 'success')
  }

  resetFilter() {
    this.filteredTransactions = [...this.transactions]
    this.setTodayDate()
    this.renderLedger()
    showToast('Filter reset', 'info')
  }

  showDeleteConfirmation() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('bankDeleteModal')
    if (!modal) {
      modal = document.createElement('div')
      modal.id = 'bankDeleteModal'
      modal.className = 'delete-modal'
      modal.innerHTML = `
        <div class="delete-modal-content">
          <h3>Delete Transaction?</h3>
          <p>This action cannot be undone. Type "CONFIRM" to proceed with deletion.</p>
          <input type="text" id="bankDeleteConfirmText" placeholder='Type "CONFIRM"'>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="bankDeleteCancel">Cancel</button>
            <button class="btn btn-danger" id="bankDeleteConfirm">Delete</button>
          </div>
        </div>
      `
      document.body.appendChild(modal)

      document.getElementById('bankDeleteCancel').addEventListener('click', () => {
        this.closeDeleteModal()
      })

      document.getElementById('bankDeleteConfirm').addEventListener('click', () => {
        this.confirmDelete()
      })

      document.getElementById('bankDeleteConfirmText').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.confirmDelete()
      })
    }

    const confirmInput = document.getElementById('bankDeleteConfirmText')
    confirmInput.value = ''
    confirmInput.focus()

    modal.classList.add('active')
    this.deleteModalActive = true
  }

  closeDeleteModal() {
    const modal = document.getElementById('bankDeleteModal')
    if (modal) {
      modal.classList.remove('active')
    }
    this.deleteModalActive = false
    this.deleteTransactionIndex = null
  }

  confirmDelete() {
    const confirmInput = document.getElementById('bankDeleteConfirmText')
    if (confirmInput.value.toUpperCase() !== 'CONFIRM') {
      showToast('Please type "CONFIRM" to proceed', 'warning')
      return
    }

    if (this.deleteTransactionIndex !== null) {
      this.transactions.splice(this.deleteTransactionIndex, 1)
      this.saveTransactions()
      this.filteredTransactions = [...this.transactions]
      this.renderLedger()
      this.closeDeleteModal()
      showToast('Transaction deleted successfully', 'success')
    }
  }

  printStatement() {
    if (this.filteredTransactions.length === 0) {
      showToast('No transactions to print', 'warning')
      return
    }

    const printWindow = window.open('', '', 'width=800,height=600')
    const shopInfo = shopManager.settings

    let totalDeposit = 0
    let totalWithdrawal = 0
    let runningBalance = 0

    // Calculate starting balance
    const filteredDates = this.filteredTransactions.map(t => t.date)
    const minDate = new Date(Math.min(...filteredDates.map(d => new Date(d))))
    
    const beforeFiltered = this.transactions.filter(t => new Date(t.date) < minDate)
    beforeFiltered.forEach(t => {
      if (t.type === 'deposit') {
        runningBalance += t.amount
      } else {
        runningBalance -= t.amount
      }
    })

    const openingBalance = runningBalance

    let tableHTML = ''
    this.filteredTransactions.forEach((transaction) => {
      if (transaction.type === 'deposit') {
        runningBalance += transaction.amount
        totalDeposit += transaction.amount
      } else {
        runningBalance -= transaction.amount
        totalWithdrawal += transaction.amount
      }

      const formattedDate = new Date(transaction.date).toLocaleDateString('en-GB')
      const depositDisplay = transaction.type === 'deposit' ? formatIndianNumber(transaction.amount) : '-'
      const withdrawalDisplay = transaction.type === 'withdrawal' ? formatIndianNumber(transaction.amount) : '-'
      const balanceDisplay = formatIndianNumber(runningBalance)

      tableHTML += `
        <tr>
          <td style="padding: 0.75rem; text-align: left; border: 1px solid #000;">${formattedDate}</td>
          <td style="padding: 0.75rem; text-align: left; border: 1px solid #000;">${transaction.purpose}</td>
          <td style="padding: 0.75rem; text-align: right; border: 1px solid #000; font-family: monospace;">${depositDisplay}</td>
          <td style="padding: 0.75rem; text-align: right; border: 1px solid #000; font-family: monospace;">${withdrawalDisplay}</td>
          <td style="padding: 0.75rem; text-align: right; border: 1px solid #000; font-family: monospace; font-weight: bold;">${balanceDisplay}</td>
        </tr>
      `
    })

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bank Statement</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2rem; background: white; }
          .print-header { text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #000; padding-bottom: 1rem; }
          .print-header h2 { margin: 0 0 0.5rem 0; font-size: 1.5rem; }
          .print-header p { margin: 0.25rem 0; font-size: 0.9rem; }
          .statement-info { margin-bottom: 1.5rem; font-size: 0.9rem; }
          .statement-info p { margin: 0.25rem 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
          th { background: #f0f0f0; padding: 0.75rem; text-align: left; border: 1px solid #000; font-weight: bold; }
          .summary { margin-top: 2rem; }
          .summary-row { display: flex; justify-content: space-between; margin: 0.5rem 0; font-size: 0.95rem; }
          .summary-row strong { min-width: 200px; }
          .print-footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #000; text-align: right; font-size: 0.85rem; }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h2>${shopInfo.shopName}</h2>
          <p>${shopInfo.shopAddress}</p>
          <p>Phone: ${shopInfo.shopPhone}</p>
        </div>
        <div class="statement-info">
          <p><strong>Bank Ledger Statement</strong></p>
          <p>Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Purpose</th>
              <th>Deposit</th>
              <th>Withdrawal</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${tableHTML}
          </tbody>
        </table>
        <div class="summary">
          <div class="summary-row">
            <strong>Opening Balance:</strong>
            <span>${formatIndianNumber(openingBalance)}</span>
          </div>
          <div class="summary-row">
            <strong>Total Deposits:</strong>
            <span>${formatIndianNumber(totalDeposit)}</span>
          </div>
          <div class="summary-row">
            <strong>Total Withdrawals:</strong>
            <span>${formatIndianNumber(totalWithdrawal)}</span>
          </div>
          <div class="summary-row" style="border-top: 1px solid #000; padding-top: 0.5rem; font-weight: bold;">
            <strong>Closing Balance:</strong>
            <span>${formatIndianNumber(runningBalance)}</span>
          </div>
        </div>
        <div class="print-footer">
          <p>This is a system-generated statement.</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  saveTransactions() {
    localStorage.setItem('bankTransactions', JSON.stringify(this.transactions))
  }

  loadTransactions() {
    const stored = localStorage.getItem('bankTransactions')
    if (stored) {
      try {
        this.transactions = JSON.parse(stored)
      } catch (e) {
        console.error('Error loading bank transactions:', e)
        this.transactions = []
      }
    }
    this.filteredTransactions = [...this.transactions]
  }
}

// ==================== INITIALIZE BANK MANAGER ====================

const shopManager = new ShopManager()
shopManager.initCustomerManagement()
const bankManager = new BankManager()
