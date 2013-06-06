<?php

class template {
	private $content;
	public function __construct($base) {
		$this->content = file_get_contents($base);
	}
	public function replace($tag, $content) {
		$data = "";
		if(is_array($content)) {
			foreach($content as $c) {
				$data .= file_get_contents($c) . "\r\n";
			}
		} else {
			$data = file_get_contents($content);
		}
		$this->content = str_replace($tag, $data, $this->content);
	}
	public function send() {
		print($this->content);
	}
}

?>
