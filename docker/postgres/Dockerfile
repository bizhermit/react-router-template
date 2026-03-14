FROM postgres:18-bookworm

RUN set -eux \
  && apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends locales \
  && sed -i 's/^# *ja_JP\.UTF-8 UTF-8/ja_JP.UTF-8 UTF-8/' /etc/locale.gen \
  && grep -q '^ja_JP\.UTF-8 UTF-8' /etc/locale.gen || echo 'ja_JP.UTF-8 UTF-8' >> /etc/locale.gen \
  && locale-gen ja_JP.UTF-8 \
  && rm -rf /var/lib/apt/lists/*

ENV LANG=ja_JP.UTF-8 \
  LC_ALL=ja_JP.UTF-8 \
  LANGUAGE=ja_JP:ja
