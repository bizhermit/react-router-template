/* eslint-disable no-console */
import type { IndexedDBController, IndexedDBStores } from "$/client/indexeddb";
import getIndexedDB from "$/client/indexeddb";
import { Button } from "$/components/elements/button";
import { Carousel, type CarouselOptions, type CarouselRef } from "$/components/elements/carousel";
import { Details } from "$/components/elements/details";
import { Dialog, useDialog } from "$/components/elements/dialog";
import { CheckBox } from "$/components/elements/form/check-box";
import { NumberBox } from "$/components/elements/form/number-box";
import { Text } from "$/components/elements/i18n-text";
import { $alert, $confirm, $toast } from "$/components/elements/message-box";
import { Style } from "$/components/elements/style";
import { clsx } from "$/components/elements/utilities";
import { useAbortController } from "$/shared/hooks/abort-controller";
import { useClickButton } from "$/shared/hooks/click-button";
import { useText } from "$/shared/hooks/i18n";
import { useInterval } from "$/shared/hooks/interval";
import { useSubWindow } from "$/shared/hooks/sub-window";
import { useToggle } from "$/shared/hooks/toggle";
import { formatDate } from "$/shared/objects/date";
import { useTheme } from "$/shared/providers/theme";
import sleep from "$/shared/timing/sleep";
import { useEffect, useRef, useState } from "react";
import { api } from "~/api/shared/internal";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <ThemeComponent />
      <IndexedDBComponent />
      <StreamCompoment />
      <DialogComponent />
      <FetchComponent />
      <CarouselComponent />
      <SubWindowComponent />
      <HooksComponent />
      <div>
        <Text i18nKey="sandbox.title" />
      </div>
    </div>
  );
};

function ThemeComponent() {
  const { theme, setTheme } = useTheme();
  const { flag, toggle } = useToggle(false);

  const colors = ["primary", "secondary", "mute", "danger"] as const;

  return (
    <section>
      <Details summary="Theme">
        <div className="flex flex-row flex-wrap gap-2">
          <Button
            onClick={() => {
              setTheme("light");
            }}
          >
            light
          </Button>
          <Button
            onClick={() => {
              setTheme("dark");
            }}
          >
            dark
          </Button>
          <Button
            onClick={() => {
              setTheme("auto");
            }}
          >
            auto
          </Button>
          <span>
            {theme}
          </span>
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          <Button onClick={toggle}>disbaled: {String(flag)}</Button>
        </div>
        <ul>
          <li>
            <h2>default</h2>
            <div className="flex flex-row flex-wrap gap-2">
              <Button
                {...useClickButton({
                  disabled: flag,
                  onClick: async ({ unlock }) => {
                    console.log("click");
                    await sleep(3000);
                    unlock();
                  },
                })}
              >
                OutlineButton
              </Button>
              <Button disabled={flag} appearance="fill">FillButton</Button>
              <Button disabled={flag} appearance="text">TextButton</Button>
            </div>
          </li>
          {colors.map(color => {
            return (
              <li key={color}>
                <h2
                  className={clsx(
                    color === "primary" && "text-primary",
                    color === "secondary" && "text-secondary",
                    color === "mute" && "text-mute",
                    color === "danger" && "text-danger",
                  )}
                >
                  {color}
                </h2>
                <div className="flex flex-row flex-wrap gap-2">
                  <Button disabled={flag} color={color}>OutlineButton</Button>
                  <Button disabled={flag} color={color} appearance="fill">FillButton</Button>
                  <Button disabled={flag} color={color} appearance="text">TextButton</Button>
                </div>
              </li>
            );
          })}
        </ul>
      </Details>
    </section>
  );
};

type Stores = IndexedDBStores<{
  hoge: {
    key: "email";
    data: {
      email: string;
      name: string;
      age: number;
    };
  };
}>;

function IndexedDBComponent() {
  const [db, setDB] = useState<IndexedDBController<Stores> | undefined>(undefined);

  useEffect(() => {
    getIndexedDB<Stores>({
      name: "template",
      upgrade: async ({ db, newVersion, oldVersion }) => {
        db.createObjectStore("hoge", { keyPath: "email" });
      },
    }).then((controller) => {
      setDB(controller);
      // controller.trans({ storeNames: "hoge" }, async ({ stores: { hoge } }) => {
      //   const value = await hoge.getByKey("hoge@example.com");
      //   console.log(value?.email);
      //   await hoge.deleteByKey("fuga@example.com");
      //   return;
      // });
    });
  }, []);

  const showButtonClickProps = useClickButton({
    onClick: async ({ unlock }) => {
      if (!db) return unlock();
      const value = await db.read({
        storeNames: "hoge",
      }, async ({ hoge }) => {
        return await hoge.getByKey("hoge@example.com");
      });
      console.log("get", value);
      unlock();
    },
  });

  const addButtonClickProps = useClickButton({
    onClick: async ({ unlock }) => {
      if (!db) return unlock();
      const key = await db.write({
        storeNames: "hoge",
      }, async ({ hoge }) => {
        return await hoge.insert({
          email: "hoge@example.com",
          age: 18,
          name: "Tarou",
        });
      });
      console.log("insert", key);
      unlock();
    },
  });

  const updateButtonClickProps = useClickButton({
    onClick: async ({ unlock }) => {
      if (!db) return unlock();
      const key = await db.write({
        storeNames: "hoge",
      }, async ({ hoge }) => {
        const value = await hoge.getByKey("hoge@example.com");
        if (value == null) return;
        value.age = 88;
        return await hoge.update(value);
      });
      console.log("update", key);
      unlock();
    },
  });

  const upsertButtonClickProps = useClickButton({
    onClick: async ({ unlock }) => {
      if (!db) return unlock();
      const key = await db.write({
        storeNames: "hoge",
      }, async ({ hoge }) => {
        hoge.upsert({
          email: "fuga@example.com",
          age: 0,
          name: formatDate(new Date(), "yyyy-MM-dd hh:mm:ss") || "",
        });
      });
      console.log("upsert", key);
      unlock();
    },
  });

  const deleteButtonClickProps = useClickButton({
    onClick: async ({ unlock }) => {
      if (!db) return unlock();
      const result = await db.write({
        storeNames: "hoge",
      }, async ({ hoge }) => {
        return await hoge.deleteByKey("hoge@example.com");
      });
      console.log("delete", result);
      unlock();
    },
  });

  return (
    <section>
      <Details summary="IndexedDB">
        {db == null
          ? "loading..."
          : <>
            <div className="flex flex-row flex-wrap gap-2">
              <Button {...showButtonClickProps}>
                show
              </Button>
              <Button{...addButtonClickProps}>
                add
              </Button>
              <Button {...updateButtonClickProps}>
                update
              </Button>
              <Button {...upsertButtonClickProps}>
                upsert
              </Button>
              <Button {...deleteButtonClickProps}>
                delete
              </Button>
            </div>
          </>}
      </Details>
    </section>
  );
};

function StreamCompoment() {
  const [output, setOutput] = useState("");
  const abortController = useAbortController();

  async function fetchStream(timeout?: number) {
    await abortController.start(async (signal, setAbortCallback) => {
      try {
        const res = await fetch("/sandbox/stream", {
          method: "POST",
          signal,
        });
        if (!res.ok) throw new Error("response error");
        const reader = res.body?.getReader();

        setAbortCallback(() => {
          reader!.cancel("client aborted");
        });

        const decorder = new TextDecoder();
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          setOutput((prev) => prev + decorder.decode(value));
        }
      } catch (e) {
        console.error(e);
      }
    }, timeout);

    // try {
    //   const res = await fetch("/sandbox/stream", {
    //     method: "POST",
    //     signal: abortController.create(timeout),
    //   });
    //   if (!res.ok) throw new Error("response error");
    //   const reader = res.body?.getReader();
    //   const decorder = new TextDecoder();

    //   while (true) {
    //     const { done, value } = await reader!.read();
    //     if (done) break;
    //     setOutput((prev) => prev + decorder.decode(value));
    //   }
    // } catch (e) {
    //   console.error(e);
    // } finally {
    //   abortController.dispose();
    // }
  }

  const isProcessing = abortController.state === "processing";

  return (
    <section>
      <Details summary="Stream Response">
        <div className="flex flex-row flex-wrap gap-2">
          <Button
            {...useClickButton({
              disabled: isProcessing,
              onClick: async ({ unlock }) => {
                await fetchStream();
                unlock();
              },
            })}
          >
            start
          </Button>
          <Button
            {...useClickButton({
              disabled: isProcessing,
              onClick: async ({ unlock }) => {
                await fetchStream(5000);
                unlock();
              },
            })}
          >
            start(timeout: 5s)
          </Button>
          <Button
            disabled={!isProcessing}
            onClick={() => {
              abortController.abort();
            }}
          >
            abort
          </Button>
          <Button
            onClick={() => {
              setOutput("");
            }}
          >
            reset output
          </Button>
          <span>{abortController.state}</span>
        </div>
        <div className="wrap-break-word">
          {output}
        </div>
      </Details>
    </section>
  );
};

function DialogComponent() {
  const dialog = useDialog();
  const [count, setCount] = useState(0);
  const t = useText();

  const closeWhenScrolled = useToggle();
  const preventEscapeClose = useToggle();
  const preventCloseWhenClickOuter = useToggle();
  const preventRootScroll = useToggle();
  const anchorRef = useRef<HTMLButtonElement>(null!);

  return (
    <section>
      <Details summary="Dialog">
        <div className="flex flex-row flex-wrap gap-2">
          <CheckBox
            appearance="togglebox"
            checked={closeWhenScrolled.flag}
            onChangeChecked={closeWhenScrolled.toggle}
          >
            closeWhenScrolled
          </CheckBox>
          <CheckBox
            appearance="togglebox"
            checked={preventEscapeClose.flag}
            onChangeChecked={preventEscapeClose.toggle}
          >
            preventEscapeClose
          </CheckBox>
          <CheckBox
            appearance="togglebox"
            checked={preventCloseWhenClickOuter.flag}
            onChangeChecked={preventCloseWhenClickOuter.toggle}
          >
            preventCloseWhenClickOuter
          </CheckBox>
          <CheckBox
            appearance="togglebox"
            checked={preventRootScroll.flag}
            onChangeChecked={preventRootScroll.toggle}
          >
            preventRootScroll
          </CheckBox>
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          <Button
            onClick={() => {
              dialog.current?.showModal();
            }}
            ref={anchorRef}
          >
            showModal
          </Button>
          <Button
            onClick={() => {
              dialog.current?.show();
            }}
          >
            show
          </Button>
          <Button
            onClick={() => {
              dialog.current?.close();
            }}
          >
            close
          </Button>
          <Button
            onClick={() => {
              setCount(c => c + 1);
            }}
          >
            countup
          </Button>
          <Button
            {...useClickButton({
              onClick: async ({ unlock }) => {
                await $alert({
                  body: "Alert",
                  color: "danger",
                });
                unlock();
              },
            })}
          >
            alert
          </Button>
          <Button
            {...useClickButton({
              onClick: async ({ unlock }) => {
                const ret = await $confirm({
                  header: "Confirm",
                  body: (
                    <>
                      <span className="w-full text-left">confirm</span>
                      <span className="w-full text-center">confirm</span>
                      <span className="w-full text-right">confirm</span>
                    </>
                  ),
                  color: "mute",
                  t,
                });
                console.log("confirm", ret);
                unlock();
              },
            })}
          >
            confirm
          </Button>
          <Button
            {...useClickButton({
              onClick: async () => {
                await $alert({
                  header: "Alert",
                  body: "1\n2\n3\n4\n",
                });
              },
            })}
          >
            alert eol
          </Button>
          <Button
            {...useClickButton({
              onClick: async () => {
                setCount(c => c + 1);
                await $toast({ body: `Toast ${count}` }).then(() => {
                  console.log("toast closed.");
                });
              },
            })}
          >
            toast
          </Button>
        </div>
        <Dialog
          className="p-4 grid items-center gap-4"
          anchor={{
            element: anchorRef,
            x: "inner-left",
            y: "outer-top",
          }}
          ref={dialog}
          closeWhenScrolled={closeWhenScrolled.flag}
          preventEscapeClose={preventEscapeClose.flag}
          preventCloseWhenClickOuter={preventCloseWhenClickOuter.flag}
          preventRootScroll={preventRootScroll.flag}
        >
          <span>{count}</span>
          <NumberBox
            value={count}
            onChangeValue={v => setCount(v ?? 0)}
          />
          <Button
            onClick={() => {
              dialog.current?.close();
            }}
          >
            close
          </Button>
        </Dialog>
      </Details>
    </section>
  );
};

function FetchComponent() {
  return (
    <section>
      <Details summary="Fetch">
        <div className="flex flex-row flex-wrap gap-2">
          <Button
            {...useClickButton({
              onClick: async ({ unlock }) => {
                try {
                  const res = await api.get("/health");
                  if (!res.ok) {
                    return;
                  }
                  console.log(res.data.now);
                } catch (e) {
                  console.error(e);
                } finally {
                  unlock();
                }
              },
            })}
          >
            health
          </Button>
          <Button
            {...useClickButton({
              onClick: async ({ unlock }) => {
                try {
                  const res = await api.get("/sandbox/api/{id}", {
                    path: {
                      id: "1",
                    },
                  });
                  console.log(res);
                  if (!res.ok) {
                    return;
                  }

                  if (res.status === 200) {
                    res.data;
                  } else {
                    // res.data
                  }
                } catch (e) {
                  console.error(e);
                } finally {
                  unlock();
                }
              },
            })}
          >
            get
          </Button>
          <Button
            {...useClickButton({
              onClick: async ({ unlock }) => {
                try {
                  const res = await api.post("/sandbox/api", {
                    body: {
                      title: "sample title",
                      body: "sample body",
                      updatedAt: "",
                    },
                  });
                  console.log(res);
                } catch (e) {
                  console.error(e);
                } finally {
                  unlock();
                }
              },
            })}
          >
            post
          </Button>
          <Button
            {...useClickButton({
              onClick: async ({ unlock }) => {
                try {
                  const res = await api.put("/sandbox/api/{id}", {
                    path: {
                      id: "1",
                    },
                    body: {
                      title: "sample",
                      body: "sample",
                      updatedAt: "2025-11-11T11:11:11.111",
                    },
                  });
                  console.log(res);
                } catch (e) {
                  console.error(e);
                } finally {
                  unlock();
                }
              },
            })}
          >
            put
          </Button>
          <Button
            {...useClickButton({
              onClick: async ({ unlock }) => {
                try {
                  const res = await api.delete("/sandbox/api/{id}", {
                    path: {
                      id: "1",
                    },
                  });
                  console.log(res);
                } catch (e) {
                  console.error(e);
                } finally {
                  unlock();
                }
              },
            })}
          >
            delete
          </Button>
        </div>
      </Details>
    </section>
  );
};

function CarouselComponent() {
  const [align, setAlign] = useState<CarouselOptions["align"]>();
  const [removePaddingSpace, setRemovePaddingSpace] = useState<CarouselOptions["removePadding"]>();
  const [slideWidth, setSlideWidth] = useState<string | undefined>(undefined);
  const carousel = useRef<CarouselRef | null>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <section>
      <Details summary="Carousel">
        <div>
          <span>Align: {align} &lt;- </span>
          <Button onClick={() => setAlign(undefined)}>unset</Button>
          <Button onClick={() => setAlign("start")}>start</Button>
          <Button onClick={() => setAlign("center")}>center</Button>
          <Button onClick={() => setAlign("end")}>end</Button>
        </div>
        <div>
          <span>remove PaddingSpace: {String(removePaddingSpace)} &lt;- </span>
          <Button onClick={() => setRemovePaddingSpace(undefined)}>unset</Button>
          <Button onClick={() => setRemovePaddingSpace(false)}>padding</Button>
          <Button onClick={() => setRemovePaddingSpace(true)}>remove</Button>
        </div>
        <div>
          <span>slide width</span>
          <Button onClick={() => setSlideWidth(undefined)}>unset</Button>
          <Button onClick={() => setSlideWidth("100%")}>100%</Button>
          <Button onClick={() => setSlideWidth("75%")}>75%</Button>
          <Button onClick={() => setSlideWidth("100px")}>100px</Button>
          <Button onClick={() => setSlideWidth("250px")}>250px</Button>
        </div>
        <div className="w-full bg-red-600 p-8 flex flex-col h-75">
          {
            slideWidth != null &&
            <Style suppressHydrationWarning>
              {`#carousel{--slide-width:${slideWidth}}`}
            </Style>
          }
          <Carousel
            className="w-full bg-bg grow shrink"
            align={align}
            removePadding={removePaddingSpace}
            ref={carousel}
            id="carousel"
            onChangeScroll={setHasScroll}
            onChange={setCurrentIndex}
          >
            {[0, 1, 2, 3, 4, 5].map((num) => {
              return {
                key: num,
                element: (
                  <div className="grid place-items-center h-full w-full border border-gray-500">
                    {num}
                  </div>
                ),
              };
            })}
          </Carousel>
          {hasScroll &&
            <ol className="flex flex-row flex-wrap justify-center w-full gap-4 flex-none">
              {
                [0, 1, 2, 3, 4, 5].map((num) => {
                  return (
                    <li key={num}>
                      <Button
                        appearance="fill"
                        onClick={() => carousel.current?.select(num)}
                        color={currentIndex === num ? "primary" : "mute"}
                      >
                        {num}
                      </Button>
                    </li>
                  );
                })
              }
            </ol>}
        </div>
      </Details>
    </section>
  );
};

function SubWindowComponent() {
  const win = useSubWindow();

  return (
    <section>
      <Details summary="Sub Window">
        <div className="flex flex-row flex-wrap gap-2">
          <Button
            onClick={() => {
              win.closeAll();
            }}
          >
            close all
          </Button>
          <Button
            onClick={() => {
              win.open({
                url: "/sandbox?trigger=unmount",
                closeTrigger: {
                  unmount: true,
                },
              });
            }}
          >
            open(unmount)
          </Button>
          <Button
            onClick={() => {
              win.open({
                url: "/sandbox?trigger=closeTab",
                closeTrigger: {
                  closeTab: true,
                },
              });
            }}
          >
            open(close tab)
          </Button>
          <Button
            onClick={() => {
              win.open({
                url: "/sandbox?trigger=transitionPage",
                closeTrigger: {
                  transitionPage: true,
                },
              });
            }}
          >
            open(transition page)
          </Button>
          <Button
            onClick={() => {
              win.open({
                url: "/sandbox?trigger=none",
              });
            }}
          >
            open
          </Button>
        </div>
      </Details>
    </section>
  );
};

function HooksComponent() {
  const intervalSwitch = useToggle(false);
  const [intervalCount, setIntervalCount] = useState(0);

  const interval = useInterval(
    () => {
      setIntervalCount(intervalCount + 1);
    },
    intervalSwitch.flag ? 1000 : false
  );

  return (
    <section>
      <Details summary="Hooks">
        <table>
          <tbody>
            <tr>
              <th>interval</th>
              <td>
                <Button
                  onClick={() => {
                    intervalSwitch.on();
                  }}
                >
                  start
                </Button>
              </td>
              <td>
                <Button
                  onClick={() => {
                    intervalSwitch.off();
                  }}
                >
                  stop
                </Button>
              </td>
              <td>{intervalCount}</td>
            </tr>
          </tbody>
        </table>
      </Details>
    </section>
  );
};
