import { Player, PlayerColor } from './player';

describe('Player.changeMoney elimination', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player('p1', PlayerColor.red, 'Alice');
  });

  it('does not flag elimination while money stays positive', () => {
    player.changeMoney(-1000);
    expect(player.Eliminated).toBe(false);
  });

  it('flags elimination when money drops to zero', () => {
    player.changeMoney(-player.Money);
    expect(player.Eliminated).toBe(true);
  });

  it('flags elimination when money goes negative', () => {
    player.changeMoney(-(player.Money + 1));
    expect(player.Eliminated).toBe(true);
  });

  it('notifies subscribers exactly once on transition to eliminated', () => {
    const listener = jest.fn();
    player.onEliminated(listener);

    player.changeMoney(-(player.Money + 50));
    player.changeMoney(-100);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('invokes all registered listeners', () => {
    const a = jest.fn();
    const b = jest.fn();
    player.onEliminated(a);
    player.onEliminated(b);

    player.changeMoney(-player.Money);

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
