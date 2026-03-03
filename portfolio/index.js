const DEFAULT_LANG = "en";
const SUPPORTED_LANGS = ["en", "vi"];

const storageKey = "portfolio-lang";

const normalizeLang = (lang) => {
	if (!lang) return DEFAULT_LANG;
	const lower = lang.toLowerCase();
	if (SUPPORTED_LANGS.includes(lower)) return lower;
	if (lower.startsWith("vi")) return "vi";
	return DEFAULT_LANG;
};

const getInitialLang = () => {
	const saved = localStorage.getItem(storageKey);
	if (saved) return normalizeLang(saved);
	return DEFAULT_LANG;
};

const setHtmlLang = (lang) => {
	document.documentElement.setAttribute("lang", lang);
};

const applyTranslations = (translations) => {
	document.querySelectorAll("[data-i18n]").forEach((el) => {
		const key = el.getAttribute("data-i18n");
		if (!key) return;
		const value = translations[key];
		if (value !== undefined) {
			el.textContent = value;
			if (el.tagName.toLowerCase() === "title") {
				document.title = value;
			}
		}
	});

	document.querySelectorAll("[data-i18n-list]").forEach((el) => {
		const key = el.getAttribute("data-i18n-list");
		if (!key) return;
		const items = translations[key];
		if (!Array.isArray(items)) return;
		el.innerHTML = "";
		items.forEach((item) => {
			const li = document.createElement("li");
			li.textContent = item;
			el.appendChild(li);
		});
	});
};

const loadIncludes = async () => {
	const targets = document.querySelectorAll("[data-include]");
	const promises = Array.from(targets).map(async (el) => {
		const file = el.getAttribute("data-include");
		if (!file) return;
		const response = await fetch(file, { cache: "no-cache" });
		if (response.ok) {
			el.innerHTML = await response.text();
		}
	});
	await Promise.all(promises);
};

const loadTranslations = async (lang) => {
	const response = await fetch(`locales/${lang}.json`, { cache: "no-cache" });
	if (!response.ok) {
		throw new Error("Unable to load translations");
	}
	return response.json();
};

const updateLanguage = async (lang) => {
	const normalized = normalizeLang(lang);
	try {
		const translations = await loadTranslations(normalized);
		applyTranslations(translations);
		setHtmlLang(normalized);
		localStorage.setItem(storageKey, normalized);
	} catch (error) {
		if (normalized !== DEFAULT_LANG) {
			const fallback = await loadTranslations(DEFAULT_LANG);
			applyTranslations(fallback);
			setHtmlLang(DEFAULT_LANG);
			localStorage.setItem(storageKey, DEFAULT_LANG);
		}
	}
};

const init = async () => {
	await loadIncludes();
	const select = document.getElementById("lang-switch");
	const initial = DEFAULT_LANG;
	localStorage.setItem(storageKey, initial);
	if (select) {
		select.checked = initial === "en";
		select.addEventListener("change", (event) => {
			updateLanguage(event.target.checked ? "en" : "vi");
		});
	}
	updateLanguage(initial);
};

document.addEventListener("DOMContentLoaded", () => {
	init();
});
