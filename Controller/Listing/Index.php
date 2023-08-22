<?php

declare(strict_types=1);

namespace Chernenko\Tables\Controller\Listing;

use Magento\Framework\App\Action\HttpGetActionInterface;
use Magento\Framework\View\Result\PageFactory;

class Index implements HttpGetActionInterface
{
    public function __construct(
        private readonly PageFactory $pageFactory
    ) {
    }

    public function execute()
    {
        $resultPage = $this->pageFactory->create();
        $resultPage->getConfig()->getTitle()->set(__('Demo UI Listing Tables'));

        return $this->pageFactory->create();
    }
}
