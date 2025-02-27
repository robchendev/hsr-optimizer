import { Flex } from 'antd'
import { memo } from 'react'
import { HeaderText } from 'components/HeaderText'
import { TooltipImage } from 'components/TooltipImage'
import { Hint } from 'lib/hint'
import DisplayFormControl from './DisplayFormControl'
import { characterOptionMapping } from 'lib/characterConditionals'
import { Eidolon } from 'types/Character'
import { DataMineId } from 'types/Common'

export interface CharacterConditionalDisplayProps {
  id?: DataMineId
  eidolon: Eidolon
  teammateIndex?: number
}

export const CharacterConditionalDisplay = memo(({ id, eidolon, teammateIndex }: CharacterConditionalDisplayProps) => {
  console.log('getDisplayForCharacter', id)
  // TODO revisit type workaround
  const characterId = id as unknown as keyof typeof characterOptionMapping
  if (!id || !characterOptionMapping[characterId]) {
    return (
      <Flex justify="space-between" align="center">
        <HeaderText>Character passives</HeaderText>
        <TooltipImage type={Hint.characterPassives()} />
      </Flex>
    )
  }

  const characterFn = characterOptionMapping[characterId]

  const character = characterFn(eidolon)
  const content = teammateIndex != null
    ? (character.teammateContent ? character.teammateContent(teammateIndex) : undefined)
    : character.content()

  return (
    <Flex vertical gap={5}>
      {(teammateIndex == null)
      && (
        <Flex justify="space-between" align="center">
          <HeaderText>Character passives</HeaderText>
          <TooltipImage type={Hint.characterPassives()} />
        </Flex>
      )}
      <DisplayFormControl content={content} teammateIndex={teammateIndex} />
    </Flex>
  )
})

CharacterConditionalDisplay.displayName = 'CharacterConditionalDisplay'
