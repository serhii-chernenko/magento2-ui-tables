<?php

namespace Chernenko\Tables\Block;

class Listing extends \Magento\Framework\View\Element\Template
{
    protected $_template = 'Chernenko_Tables::listing.phtml';

    public function _toHtml(): string
    {
        $this->_setScope();

        return $this->validateXmlData() ?: parent::_toHtml();
    }

    protected function _setScope(): void
    {
        $this->setData('scope', $this->_getComponentName());
    }

    protected function _getComponentName(): string
    {
        return array_keys($this->jsLayout['components'])[0] ?? '';
    }

    protected function _getComponentData(): array
    {
        return $this->jsLayout['components'][$this->_getComponentName()] ?? [];
    }

    protected function validateXmlData(): string
    {
        $componentData = $this->_getComponentData();

        if (!$this->_getComponentName() || empty($componentData)) {
            return <<<END
Add a listing component to the jsLayout structure. Specify unique component name instead of tableListingDemo.<br/>
E.g.: tableListingProducts, tableListingCarts, etc.
<pre>
&lt;argument name="jsLayout" xsi:type="array"&gt;
    &lt;item name="components" xsi:type="array"&gt;
        &lt;item name="tableListingDemo" xsi:type="array"&gt;
            &lt;item name="component" xsi:type="string"&gt;Chernenko_Tables/js/view/listing&lt;/item&gt;
        &lt;/item&gt;
    &lt;/item&gt;
&lt;/argument&gt;
</pre>
END;
        } elseif (empty($componentData['fetchSource'])) {
            return <<<END
Add <code>item name="fetchSource"</code> to the XML structure of the root component.
<pre>
&lt;item name="tableListingDemo" xsi:type="array"&gt;
    &lt;item name="fetchSource" xsi:type="array"&gt;
        &lt;item name="url" xsi:type="string"&gt;route_id/controller/action&lt;/item&gt;
    &lt;/item&gt;
&lt;/item&gt;
</pre>
<pre>
&lt;item name="tableListingDemo" xsi:type="array"&gt;
    &lt;item name="fetchSource" xsi:type="array"&gt;
        &lt;item name="url" xsi:type="string"&gt;https://domain.com/entities&lt;/item&gt;
        &lt;item name="external" xsi:type="boolean"&gt;true&lt;/item&gt;
    &lt;/item&gt;
&lt;/item&gt;
</pre>
END;
        }

        return '';
    }
}
