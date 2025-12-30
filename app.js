// Categories Names in Arabic
const categoryNames = {
  basic: { title: 'الأوامر الأساسية', icon: 'fa-terminal', color: 'blue' },
  sim: { title: 'أوامر بطاقة SIM', icon: 'fa-sim-card', color: 'green' },
  network: { title: 'أوامر الشبكة', icon: 'fa-network-wired', color: 'purple' },
  calls: { title: 'أوامر المكالمات', icon: 'fa-phone', color: 'indigo' },
  sms: { title: 'أوامر الرسائل SMS', icon: 'fa-sms', color: 'pink' },
  gprs: { title: 'أوامر الإنترنت GPRS/LTE', icon: 'fa-globe', color: 'cyan' },
  advanced: { title: 'الأوامر المتقدمة', icon: 'fa-cogs', color: 'orange' }
}

let allCommands = {}

// Load commands on page load
async function loadCommands() {
  try {
    const response = await axios.get('/api/commands')
    allCommands = response.data
    displayCommands(allCommands)
  } catch (error) {
    console.error('Error loading commands:', error)
    document.getElementById('content').innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-exclamation-triangle text-4xl text-red-600"></i>
        <p class="text-red-600 mt-4">حدث خطأ في تحميل البيانات</p>
      </div>
    `
  }
}

// Display commands
function displayCommands(commands) {
  const content = document.getElementById('content')
  let html = ''

  Object.entries(commands).forEach(([category, cmds]) => {
    const catInfo = categoryNames[category]
    html += `
      <div class="mb-10">
        <div class="flex items-center mb-6">
          <div class="category-badge text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <i class="fas ${catInfo.icon} text-2xl ml-3"></i>
            <h2 class="text-2xl font-bold">${catInfo.title}</h2>
          </div>
          <div class="flex-grow h-1 bg-gradient-to-l from-${catInfo.color}-200 mr-4 rounded"></div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${cmds.map(cmd => `
            <div class="command-card bg-white rounded-lg shadow-md p-6 hover:shadow-xl">
              <div class="flex items-start justify-between mb-3">
                <code class="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded">${escapeHtml(cmd.cmd)}</code>
                <button onclick="copyCommand('${escapeHtml(cmd.cmd)}')" class="text-gray-400 hover:text-blue-600 transition">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              
              <p class="text-gray-700 mb-4 leading-relaxed">${cmd.desc}</p>
              
              <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-gray-500 uppercase">
                    <i class="fas fa-code ml-1"></i> مثال
                  </span>
                  <button onclick="copyExample('example-${category}-${cmds.indexOf(cmd)}')" class="text-xs text-gray-400 hover:text-green-600 transition">
                    <i class="fas fa-copy ml-1"></i> نسخ
                  </button>
                </div>
                <pre id="example-${category}-${cmds.indexOf(cmd)}" class="code-block text-sm p-3 rounded overflow-x-auto">${escapeHtml(cmd.example)}</pre>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  })

  content.innerHTML = html || `
    <div class="text-center py-8">
      <i class="fas fa-search text-4xl text-gray-400"></i>
      <p class="text-gray-600 mt-4">لم يتم العثور على نتائج</p>
    </div>
  `
}

// Search functionality
let searchTimeout
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout)
  const query = e.target.value.trim()
  
  searchTimeout = setTimeout(() => {
    if (query.length === 0) {
      displayCommands(allCommands)
    } else {
      searchCommands(query)
    }
  }, 300)
})

async function searchCommands(query) {
  try {
    const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`)
    displayCommands(response.data)
  } catch (error) {
    console.error('Search error:', error)
  }
}

// Copy command
function copyCommand(cmd) {
  navigator.clipboard.writeText(cmd).then(() => {
    showToast('تم نسخ الأمر بنجاح! ✓')
  }).catch(err => {
    console.error('Copy failed:', err)
  })
}

// Copy example
function copyExample(elementId) {
  const text = document.getElementById(elementId).textContent
  navigator.clipboard.writeText(text).then(() => {
    showToast('تم نسخ المثال بنجاح! ✓')
  }).catch(err => {
    console.error('Copy failed:', err)
  })
}

// Show toast notification
function showToast(message) {
  const toast = document.createElement('div')
  toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce'
  toast.innerHTML = `<i class="fas fa-check-circle ml-2"></i>${message}`
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.5s'
    setTimeout(() => toast.remove(), 500)
  }, 2000)
}

// Escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

// Add CSS animation
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`
document.head.appendChild(style)

// Initialize
loadCommands()
