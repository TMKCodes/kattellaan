<?php

class template {
	private $content;
	public function __construct($base) {
		$this->content = file_get_contents($base);
	}
	public function replace($tag, $content) {
		$this->content = str_replace($tag, $content, $this->content);
	}
	public function send() {
		print($this->template);
	}
}

?>
