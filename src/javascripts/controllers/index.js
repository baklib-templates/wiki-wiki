import { Application } from "@hotwired/stimulus"
import TocController from "./toc_controller"
import ImagesViewerController from "./images_viewer_controller"
import NavTreeController from "./nav_tree_controller"
import ThemeController from "./theme_controller"
import Clipboard from '@stimulus-components/clipboard'

const application = Application.start()
window.Stimulus = application

application.register('toc', TocController)
application.register('images-viewer', ImagesViewerController)
application.register('nav-tree', NavTreeController)
application.register('theme', ThemeController)
application.register('clipboard', Clipboard)
