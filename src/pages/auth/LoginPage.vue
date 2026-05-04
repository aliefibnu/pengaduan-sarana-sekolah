<template>
	<div class="min-h-screen w-full flex items-center justify-center bg-black">
		<div class="absolute inset-0 bg-[url('/bg-login.webp')] bg-cover bg-center filter blur-sm scale-105 opacity-80"></div>
		<div class="relative z-10 w-full max-w-md px-6">
			<form @submit.prevent="handleSubmit" class="relative bg-gradient-to-br from-white/8 to-white/6 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl overflow-hidden">
				<div class="absolute -left-10 -top-10 w-40 h-40 bg-gradient-to-br from-indigo-500 to-sky-400 opacity-20 rounded-full blur-3xl"></div>
				<div class="absolute -right-8 -bottom-8 w-36 h-36 bg-linear-to-tr from-pink-500 to-amber-400 opacity-18 rounded-full blur-3xl"></div>

				<div class="flex items-center gap-3 mb-6">
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg">🔧</div>
					<div>
						<h1 class="text-2xl font-extrabold text-white">Benerin Dong</h1>
						<p class="text-sm text-white/80">Masuk untuk melapor dan memantau progres.</p>
					</div>
				</div>

				<div class="space-y-4">
					<div>
						<label class="text-xs text-white/80 mb-2 block">NIS atau username</label>
						<div class="flex items-center gap-2 bg-white/95 rounded-lg px-3 py-2 shadow-input">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/><path d="M4 20v-1c0-2.21 3.58-4 8-4s8 1.79 8 4v1"/></svg>
							<input v-model="form.identity" placeholder="NIS atau username" class="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-400" />
						</div>
					</div>

					<div>
						<label class="text-xs text-white/80 mb-2 block">Password</label>
						<div class="flex items-center gap-2 bg-white/95 rounded-lg px-3 py-2 shadow-input">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
							<input :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="Password" class="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-400" />
							<button type="button" @click="showPassword = !showPassword" class="text-slate-500">
								<svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
								<svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-6 0-10-7-10-7a21.36 21.36 0 014.21-5.12"/><path d="M3 3l18 18"/></svg>
							</button>
						</div>
					</div>

					<div class="flex items-center justify-between text-sm text-white/70">
						<label class="inline-flex items-center gap-2"><input type="checkbox" v-model="remember" class="form-checkbox h-4 w-4 bg-white/90"/> Ingat saya</label>
						<a class="underline">Lupa password?</a>
					</div>
				</div>

				<div class="mt-6">
					<button :disabled="loading" type="submit" class="w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-indigo-600 to-sky-500 shadow-lg hover:scale-[1.01] transition-transform">
						<span v-if="!loading">Masuk</span>
						<span v-else>Memproses...</span>
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { openLoading, closeLoading, showError, showSuccess } from '@/utils/notifications'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ identity: '', password: '' })
const remember = ref(false)
const showPassword = ref(false)
const loading = ref(false)

async function handleSubmit() {
	const id = form.identity.trim()
	if (!id) return showError('NIS atau username wajib diisi')
	loading.value = true
	openLoading('Masuk...')
	try {
		const res = await authStore.signIn({ identity: form.identity, password: form.password })
		const role = res?.user?.user_metadata?.role || 'siswa'
		showSuccess('Login berhasil')
		router.replace(role === 'admin' ? '/admin' : '/siswa')
	} catch (err) {
		showError(err?.message || 'Gagal masuk')
	} finally {
		loading.value = false
		closeLoading()
	}
}

onMounted(() => {
	const el = document.querySelector('input[placeholder="NIS atau username"]')
	if (el instanceof HTMLInputElement) el.focus()
})
</script>

<style scoped>
.shadow-input { box-shadow: 0 6px 18px rgba(2,6,23,0.06); }
input::placeholder { color: rgba(100,116,139,0.6); }
input { -webkit-appearance: none; appearance: none; }
</style>
