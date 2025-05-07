import * as Turbo from "@hotwired/turbo"
import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import Controllers from './controllers'

window.Turbo = Turbo
window.Alpine = Alpine
Alpine.plugin(collapse)
Alpine.start()