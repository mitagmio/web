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
            enabled ? (
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
      <Popover.Content css={{ padding: '$10' }}>
        <Grid.Container css={{ maxWidth: 450}}>
          {nftItems.map((item, i) => (
            <Grid key={i}>
              {theme.id === item.metadata.id ? (
                <Badge
                  css={{ backgroundColor: 'var(--nextui-colors-primary)' }}
                  content={item.metadata.attributes.find(({ trait_type }) => trait_type === 'Color')?.value}
                >
                  <>
                  <Image
                    showSkeleton
                    src={item.metadata.image}
                    width={150}
                    height={150}
                    alt=""
                    css={{
                      ...(theme.color === item.metadata.theme.main && {
                        border: `3px solid var(--nextui-colors-primary)`,
                      }),
                    }}
                    onClick={() => setTheme({ color: item.metadata.theme.main, id: item.metadata.id })}
                  />
                  <Text color="rgb(77, 77, 77)" css={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translate3d(-50%, 0, 0)' }}>{item.metadata.attributes.find(({ trait_type }) => trait_type === 'Size')?.value}</Text>
                  </>
                </Badge>
              ) : (
                <Image
                  showSkeleton
                  src={item.metadata.image}
                  width={150}
                  height={150}
                  alt=""
                  css={{
                    ...(theme.color === item.metadata.theme.main && {
                      borderRadius: 16,
                    }),
                  }}
                  onClick={() => setTheme({ color: item.metadata.theme.main, id: item.metadata.id })}
                />
              )}
            </Grid>
          ))}
        </Grid.Container>
      </Popover.Content>
    </Popover>
  )
}
