<?php

test('login page returns a successful response', function () {
    $response = $this->withoutVite()->get(route('login'));

    $response->assertOk();
});