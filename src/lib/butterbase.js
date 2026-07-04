import { createClient } from '@butterbase/sdk'

export const bb = createClient({
  appId: import.meta.env.VITE_BUTTERBASE_APP_ID || 'app_lrf3gppzq7v5',
  apiUrl: import.meta.env.VITE_BUTTERBASE_API_URL || 'https://api.butterbase.ai',
})
