// Translation keys
export type TranslationKey =
  | "dashboard"
  | "products"
  | "tasks"
  | "reports"
  | "users"
  | "settings"
  | "logout"
  | "search"
  | "overview"
  | "monthlyStats"
  | "recentActivity"
  | "totalProducts"
  | "soldProducts"
  | "availableProducts"
  | "totalProfit"
  | "addProduct"
  | "productDetails"
  | "newTask"
  | "darkMode"
  | "language"
  | "english"
  | "thai"
  | "currentTime"
  | "login"
  | "register"
  | "username"
  | "password"
  | "confirmPassword"
  | "role"
  | "admin"
  | "supervisor"
  | "user"
  | "new_user"
  | "gameNames"
  | "monthRecords"
  | "systemSettings"
  | "databaseManagement"
  | "backupDatabase"
  | "restoreDatabase"
  | "productName"
  | "gameAccount"
  | "gameName"
  | "category"
  | "dateReceived"
  | "costPrice"
  | "sellingPrice"
  | "profit"
  | "status"
  | "evidence"
  | "save"
  | "cancel"
  | "edit"
  | "delete"
  | "confirmDelete"
  | "taskTitle"
  | "taskDescription"
  | "dueDate"
  | "assignedTo"
  | "createdBy"
  | "createdAt"
  | "taskStatus"
  | "started"
  | "inProgress"
  | "completed"
  | "viewDetails"
  | "noDataAvailable"
  | "welcomeBack"
  | "manageAccount"
  | "searchResults"
  | "filterBy"
  | "date"
  | "actions"
  | "saveChanges"
  | "notifications"
  | "myProfile"
  | "signOut"
  | "emailNotifications"
  | "productUpdates"
  | "taskReminders"
  | "month"
  | "year"
  | "generateReport"
  | "downloadReport"
  | "printReport"
  | "financialSummary"
  | "gameAccountManagement"
  | "accessDenied"
  | "noPermission"
  | "uploadEvidence"
  | "chooseFile"
  | "dropFileHere"
  | "loginToAccess"
  | "doNotHaveAccount"
  | "alreadyHaveAccount";

// Translation records
export interface Translations {
  [key: string]: Record<TranslationKey, string>;
}

// All translations
export const translations: Translations = {
  en: {
    dashboard: "Dashboard",
    products: "Products",
    tasks: "Tasks",
    reports: "Reports",
    users: "Users",
    settings: "Settings",
    logout: "Logout",
    gameNames: "Game Names",
    monthRecords: "Month Records",
    systemSettings: "System Settings",
    databaseManagement: "Database Management",
    backupDatabase: "Backup Database",
    restoreDatabase: "Restore Database",
    new_user: "New User",
    search: "Search...",
    overview: "Overview",
    monthlyStats: "Monthly Statistics",
    recentActivity: "Recent Activity",
    totalProducts: "Total Products",
    soldProducts: "Sold Products",
    availableProducts: "Available Products",
    totalProfit: "Total Profit",
    addProduct: "Add Product",
    productDetails: "Product Details",
    newTask: "New Task",
    darkMode: "Dark Mode",
    language: "Language",
    english: "English",
    thai: "Thai",
    currentTime: "Current Time",
    login: "Login",
    register: "Register",
    username: "Username",
    password: "Password",
    confirmPassword: "Confirm Password",
    role: "Role",
    admin: "Admin",
    supervisor: "Supervisor",
    user: "User",
    productName: "Product Name",
    gameAccount: "Game Account",
    gameName: "Game Name",
    category: "Category",
    dateReceived: "Date Received",
    costPrice: "Cost Price",
    sellingPrice: "Selling Price",
    profit: "Profit",
    status: "Status",
    evidence: "Evidence",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this item?",
    taskTitle: "Task Title",
    taskDescription: "Task Description",
    dueDate: "Due Date",
    assignedTo: "Assigned To",
    createdBy: "Created By",
    createdAt: "Created At",
    taskStatus: "Status",
    started: "Started",
    inProgress: "In Progress",
    completed: "Completed",
    viewDetails: "View Details",
    noDataAvailable: "No data available",
    welcomeBack: "Welcome back",
    manageAccount: "Manage your account",
    searchResults: "Search Results",
    filterBy: "Filter by",
    date: "Date",
    actions: "Actions",
    saveChanges: "Save Changes",
    notifications: "Notifications",
    myProfile: "My Profile",
    signOut: "Sign Out",
    emailNotifications: "Email Notifications",
    productUpdates: "Product Updates",
    taskReminders: "Task Reminders",
    month: "Month",
    year: "Year",
    generateReport: "Generate Report",
    downloadReport: "Download Report",
    printReport: "Print Report",
    financialSummary: "Financial Summary",
    gameAccountManagement: "Game Account Management",
    accessDenied: "Access Denied",
    noPermission: "You don't have permission to view this content",
    uploadEvidence: "Upload Evidence",
    chooseFile: "Choose File",
    dropFileHere: "Drop file here",
    loginToAccess: "Login to access the dashboard",
    doNotHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?"
  },
  th: {
    dashboard: "แดชบอร์ด",
    products: "สินค้า",
    tasks: "งาน",
    reports: "รายงาน",
    users: "ผู้ใช้",
    settings: "ตั้งค่า",
    logout: "ออกจากระบบ",
    gameNames: "ชื่อเกม",
    monthRecords: "ข้อมูลประจำเดือน",
    systemSettings: "ตั้งค่าระบบ",
    databaseManagement: "การจัดการฐานข้อมูล",
    backupDatabase: "สำรองฐานข้อมูล",
    restoreDatabase: "คืนค่าฐานข้อมูล",
    new_user: "ผู้ใช้ใหม่",
    search: "ค้นหา...",
    overview: "ภาพรวม",
    monthlyStats: "สถิติประจำเดือน",
    recentActivity: "กิจกรรมล่าสุด",
    totalProducts: "สินค้าทั้งหมด",
    soldProducts: "สินค้าที่ขายแล้ว",
    availableProducts: "สินค้าที่มีอยู่",
    totalProfit: "กำไรทั้งหมด",
    addProduct: "เพิ่มสินค้า",
    productDetails: "รายละเอียดสินค้า",
    newTask: "งานใหม่",
    darkMode: "โหมดมืด",
    language: "ภาษา",
    english: "อังกฤษ",
    thai: "ไทย",
    currentTime: "เวลาปัจจุบัน",
    login: "เข้าสู่ระบบ",
    register: "ลงทะเบียน",
    username: "ชื่อผู้ใช้",
    password: "รหัสผ่าน",
    confirmPassword: "ยืนยันรหัสผ่าน",
    role: "บทบาท",
    admin: "ผู้ดูแลระบบ",
    supervisor: "ผู้ควบคุม",
    user: "ผู้ใช้",
    productName: "ชื่อสินค้า",
    gameAccount: "บัญชีเกม",
    gameName: "ชื่อเกม",
    category: "หมวดหมู่",
    dateReceived: "วันที่รับ",
    costPrice: "ราคาต้นทุน",
    sellingPrice: "ราคาขาย",
    profit: "กำไร",
    status: "สถานะ",
    evidence: "หลักฐาน",
    save: "บันทึก",
    cancel: "ยกเลิก",
    edit: "แก้ไข",
    delete: "ลบ",
    confirmDelete: "คุณแน่ใจหรือไม่ที่จะลบรายการนี้?",
    taskTitle: "ชื่องาน",
    taskDescription: "รายละเอียดงาน",
    dueDate: "วันที่ครบกำหนด",
    assignedTo: "มอบหมายให้",
    createdBy: "สร้างโดย",
    createdAt: "สร้างเมื่อ",
    taskStatus: "สถานะ",
    started: "เริ่มต้น",
    inProgress: "กำลังดำเนินการ",
    completed: "เสร็จสิ้น",
    viewDetails: "ดูรายละเอียด",
    noDataAvailable: "ไม่มีข้อมูลที่มีอยู่",
    welcomeBack: "ยินดีต้อนรับกลับ",
    manageAccount: "จัดการบัญชีของคุณ",
    searchResults: "ผลการค้นหา",
    filterBy: "กรองโดย",
    date: "วันที่",
    actions: "การกระทำ",
    saveChanges: "บันทึกการเปลี่ยนแปลง",
    notifications: "การแจ้งเตือน",
    myProfile: "โปรไฟล์ของฉัน",
    signOut: "ออกจากระบบ",
    emailNotifications: "การแจ้งเตือนทางอีเมล",
    productUpdates: "อัปเดตผลิตภัณฑ์",
    taskReminders: "การแจ้งเตือนงาน",
    month: "เดือน",
    year: "ปี",
    generateReport: "สร้างรายงาน",
    downloadReport: "ดาวน์โหลดรายงาน",
    printReport: "พิมพ์รายงาน",
    financialSummary: "สรุปทางการเงิน",
    gameAccountManagement: "การจัดการบัญชีเกม",
    accessDenied: "การเข้าถึงถูกปฏิเสธ",
    noPermission: "คุณไม่มีสิทธิ์ในการดูเนื้อหานี้",
    uploadEvidence: "อัปโหลดหลักฐาน",
    chooseFile: "เลือกไฟล์",
    dropFileHere: "วางไฟล์ที่นี่",
    loginToAccess: "เข้าสู่ระบบเพื่อเข้าถึงแดชบอร์ด",
    doNotHaveAccount: "ยังไม่มีบัญชี?",
    alreadyHaveAccount: "มีบัญชีอยู่แล้ว?"
  }
};

// Get a translation by key and language
export function getTranslation(key: TranslationKey, language: string): string {
  return translations[language]?.[key] || translations["en"][key] || key;
}
