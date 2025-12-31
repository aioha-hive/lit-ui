import { html } from 'lit'

export const BackButton = (onPrevious: () => void) => {
  return html`
    <button
      type="button"
      class="text-gray-900 bg-white border border-gray-300 focus:outline-hidden hover:bg-gray-100 hover:cursor-pointer focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm pl-4 pr-5 py-1.5 items-center inline-flex dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:border-gray-600 dark:focus:ring-gray-700"
      @click=${onPrevious}
    >
      <svg
        class="w-5 h-5 text-gray-900 dark:text-white"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7" />
      </svg>
      Back
    </button>
  `
}
