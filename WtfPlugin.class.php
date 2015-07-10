<?php

/**
 * WtfPlugin.class.php
 *
 * ...
 *
 * @author  Florian Bieringer <florian.bieringer@uni-passau.de>
 * @version 0.1a
 */
class WtfPlugin extends StudIPPlugin implements SystemPlugin {

    public function __construct() {
        parent::__construct();
        PageLayout::addScript($this->getPluginURL() . '/assets/wysihtml5x-toolbar.min.js');
        PageLayout::addScript($this->getPluginURL() . '/assets/advanced_and_extended.js');
        PageLayout::addScript($this->getPluginURL() . '/assets/application.js');
        self::addStylesheet('assets/style.less');
    }
}
