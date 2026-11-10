#!/bin/sh
# Install the published dflow binary into ~/.local/bin after a SHA-256 check.
set -eu

release_base="https://github.com/dflow-sh/dflow/releases/latest/download"

classify_platform() {
	os=$1
	arch=$2
	case "$os" in
	Darwin) goos=darwin ;;
	Linux) goos=linux ;;
	*)
		echo "unknown operating system: $os" >&2
		return 1
		;;
	esac
	case "$arch" in
	x86_64 | amd64) goarch=amd64 ;;
	arm64 | aarch64) goarch=arm64 ;;
	*)
		echo "unknown cpu: $arch" >&2
		return 1
		;;
	esac
	printf '%s %s\n' "$goos" "$goarch"
}

file_sha256() {
	if command -v sha256sum >/dev/null 2>&1; then
		sha256sum "$1" | awk '{print $1}'
		return
	fi
	shasum -a 256 "$1" | awk '{print $1}'
}

line_checksum() {
	sums=$1
	name=$2
	awk -v name="$name" '
		{
			file = $NF
			sub(/^\*/, "", file)
			if (file == name) {
				print $1
				found = 1
				exit
			}
		}
		END { if (!found) exit 1 }
	' "$sums"
}

check_asset() {
	sums=$1
	asset=$2
	name=$(basename "$asset")
	expected=$(line_checksum "$sums" "$name") || return 1
	got=$(file_sha256 "$asset") || return 1
	[ "$got" = "$expected" ]
}

add_path_once() {
	bindir=$1
	case ":$PATH:" in
	*":$bindir:"*) return 0 ;;
	esac
	config=""
	case "${SHELL##*/}" in
	zsh) config="${HOME}/.zshrc" ;;
	bash) config="${HOME}/.bashrc" ;;
	*) return 0 ;;
	esac
	if [ -f "$config" ] && grep -F -q '.local/bin' "$config"; then
		return 0
	fi
	printf '\nexport PATH="%s:$PATH"\n' "$bindir" >>"$config"
}

install_dflow() {
	if [ -z "${HOME:-}" ]; then
		echo "HOME is not set" >&2
		exit 1
	fi
	platform=$(classify_platform "$(uname -s)" "$(uname -m)") || exit 1
	goos=${platform% *}
	goarch=${platform#* }
	tmpdir=$(mktemp -d)
	trap 'rm -rf "$tmpdir"' EXIT
	sums="$tmpdir/checksums.txt"
	curl -fsSL "${release_base}/checksums.txt" -o "$sums"
	asset=$(awk -v suffix="_${goos}_${goarch}" '
		{
			file = $NF
			sub(/^\*/, "", file)
			if (file ~ suffix "$") {
				print file
				found = 1
				exit
			}
		}
		END { if (!found) exit 1 }
	' "$sums") || {
		echo "the checksum file has no line for this machine" >&2
		exit 1
	}
	case "$asset" in
	*/* | "" | . | ..)
		echo "the checksum file has no line for this machine" >&2
		exit 1
		;;
	esac
	payload="$tmpdir/$asset"
	curl -fsSL "${release_base}/${asset}" -o "$payload"
	if ! check_asset "$sums" "$payload"; then
		rm -f "$payload"
		echo "the checksum did not match" >&2
		exit 1
	fi
	bindir="${HOME}/.local/bin"
	mkdir -p "$bindir"
	dest="${bindir}/dflow"
	mv "$payload" "$dest"
	chmod 0755 "$dest"
	add_path_once "$bindir"
	printf '%s\n' "$dest"
}

if [ "$(basename "$0")" = "install.sh" ]; then
	install_dflow
fi
