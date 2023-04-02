import { useContext, useEffect, useState } from 'react'
import { Button, Popover, Image, Grid, Badge, Text } from '@nextui-org/react'
import { AppContext } from 'contexts/AppContext'
import { ABS13, ABS14 } from 'assets/icons'

export const ThemeSwitcher = () => {
  const { nftItems, enabled, theme, setEnabled, setTheme } = useContext(AppContext)

  return (
    <Popover>
      <Popover.Trigger>
        <Button
          icon={
            theme ? (
              <Image
                showSkeleton
                src={nftItems?.find(({ metadata }) => metadata.id === theme.id)?.metadata.image_diamond}
                width={48}
                height={48}
                alt=""
              />
            ) : enabled ? (
              <ABS13 style={{ fill: 'var(--nextui-colors-link)', fontSize: 24 }} />
            ) : (
              <ABS14 style={{ fill: 'var(--nextui-colors-link)', fontSize: 24 }} />
            )
          }
          color="secondary"
          size="sm"
          flat
          css={{ minWidth: 'auto', padding: '$4', background: 'transparent', border: '1px solid $blue100' }}
          auto
          onClick={() => setEnabled((i) => !i)}
        />
      </Popover.Trigger>
      <Popover.Content
        css={{
          padding: '$0',
          border: '1px solid var(--nextui--navbarBorderColor)',
          borderRadius: 4,
          maxHeight: 332,
          background: 'var(--nextui-colors-backgroundAlpha)',
        }}
      >
        <Grid.Container css={{ maxWidth: 300 }}>
          {enabled ? (
            <Grid xs={12} css={{ position: 'sticky', top: 0, zIndex: 999 }}>
              <Button
                flat
                size="sm"
                icon={<ABS14 style={{ fill: 'var(--nextui-colors-link)', fontSize: 24 }} />}
                css={{ minWidth: '100%', borderRadius: 0 }}
                onClick={() => setEnabled(false)}
              >
                Switch to light
              </Button>
            </Grid>
          ) : (
            <Grid xs={12} css={{ position: 'sticky', top: 0, zIndex: 999 }}>
              <Button
                flat
                size="sm"
                icon={<ABS13 style={{ fill: 'var(--nextui-colors-link)', fontSize: 24 }} />}
                css={{ minWidth: '100%', borderRadius: 0 }}
                onClick={() => setEnabled(true)}
              >
                Switch to dark
              </Button>
            </Grid>
          )}
          {nftItems.map((item, i) => {
            const color = item.metadata.attributes.find(({ trait_type }) => trait_type === 'Color')?.value

            return (
              <Grid key={i}>
                <Badge
                  placement="top-left"
                  css={{ backgroundColor: item.metadata.theme.main, left: '50%', marginTop: '$5' }}
                  size="xs"
                  content={theme.id === item.metadata.id && color}
                >
                  <div
                    style={{
                      border: `${theme.id === item.metadata.id ? 1 : 1}px solid ${
                        theme.id === item.metadata.id ? item.metadata.theme.main : 'var(--nextui--navbarBorderColor)'
                      }`,
                    }}
                  >
                    <Image
                      showSkeleton
                      src={item.metadata.image}
                      width={98}
                      height={98}
                      alt=""
                      css={{
                        transition: '1s',
                        ...(theme.id === item.metadata.id && {
                          transform: 'scale3d(1.2, 1.2, 1.2) translate3d(0, 5px, 0)',
                        }),
                      }}
                      onClick={() => setTheme({ color: color.toLowerCase(), id: item.metadata.id })}
                    />
                    {/* <Text
                    color="rgb(77, 77, 77)"
                    css={{
                      position: 'absolute',
                      bottom: 5,
                      left: '50%',
                      transform: 'translate3d(-50%, 0, 0)',
                      transition: '350ms',
                    }}
                  >
                    {item.metadata.attributes.find(({ trait_type }) => trait_type === 'Size')?.value}
                  </Text> */}
                  </div>
                </Badge>
              </Grid>
            )
          })}
        </Grid.Container>
      </Popover.Content>
    </Popover>
  )
}
