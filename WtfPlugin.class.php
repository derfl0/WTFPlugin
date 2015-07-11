<?php

/**
 * WtfPlugin.class.php
 *
 * @author  Florian Bieringer <florian.bieringer@uni-passau.de>
 * @version 0.1a
 */
class WtfPlugin extends StudIPPlugin implements SystemPlugin {

    public function __construct() {
        parent::__construct();
        PageLayout::addScript($this->getPluginURL() . '/assets/wysihtml4/dist/wysihtml5x-toolbar.min.js');
        PageLayout::addScript($this->getPluginURL() . '/assets/wysihtml4/parser_rules/advanced_and_extended.js');
        PageLayout::addScript($this->getPluginURL() . '/assets/application.js');
        self::addStylesheet('assets/style.less');
    }

    public function wtf_action() {
        $whitelist = array('heading', 'list', 'bold', 'italics', 'underline', 'media');
        foreach (StudipFormat::getStudipMarkups() as $name => $useless) {
            if (!in_array($name, $whitelist)) {
                StudipFormat::removeStudipMarkup($name);
            }
        }
        echo formatReady(Request::get('markup'));
    }

    public function preview_action() {
        echo formatReady(Request::get('markup'));
    }

}
