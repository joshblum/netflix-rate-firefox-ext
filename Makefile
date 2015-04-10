.PHONY: lint extension run

lint:
	-jshint -c .jshintrc --exclude-path .jshintignore .

extension: lint
	cfx xpi

run:
	cfx run
